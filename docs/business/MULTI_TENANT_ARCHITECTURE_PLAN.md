# Multi-Tenant Architecture Plan

## Overview

This document outlines the comprehensive plan to convert the Kootenay Tech Community platform from a single-tenant application into a multi-tenant SaaS platform. Each community will have its own domain, isolated data, and customizable configuration while sharing the same underlying infrastructure.

## Current Architecture Assessment

### Strengths Supporting Multi-Tenancy

1. **Modern Tech Stack**
   - React 18 + TypeScript for robust frontend
   - Supabase with PostgreSQL for scalable backend
   - Redux Toolkit + React Query hybrid pattern
   - Sophisticated settings and configuration system

2. **Advanced Settings Infrastructure**
   - Comprehensive settings system with categories, definitions, and values
   - Feature toggle system for per-tenant functionality
   - Community configuration table (already supports multi-community concept)
   - Settings audit trail and versioning

3. **Robust Permission System**
   - Three-level permission architecture (system, custom, entity-specific)
   - Role-based access control with inheritance
   - Row Level Security (RLS) policies in database
   - Entity-specific permissions for companies/groups

4. **Well-Structured Data Model**
   - Clean separation of concerns
   - Modular feature organization (`/src/features/`)
   - Extensible database schema
   - Proper indexing and relationships

## Multi-Tenant Design Strategy

### Architecture Pattern: Schema-Per-Tenant with Shared Infrastructure

**Why This Approach:**
- **Data Isolation**: Each tenant gets complete data isolation
- **Compliance**: Easier to meet data residency and privacy requirements
- **Customization**: Per-tenant schema customizations possible
- **Performance**: No cross-tenant query interference
- **Security**: Tenant breaches cannot affect other tenants

## Implementation Plan

### Phase 1: Foundation Infrastructure (Weeks 1-2)

#### 1.1 Tenant Management System

**Database Changes:**
```sql
-- Core tenant table
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
    domain TEXT UNIQUE, -- Custom domain (optional)
    subdomain TEXT UNIQUE, -- Default: {slug}.platform.com
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Subscription info
    trial_ends_at TIMESTAMPTZ,
    subscription_status TEXT DEFAULT 'trial',
    
    -- Billing
    billing_email TEXT,
    billing_address JSONB,
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    feature_flags JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    
    -- Limits
    max_users INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 10,
    
    -- Contact info
    owner_user_id UUID REFERENCES auth.users(id),
    admin_emails TEXT[],
    
    CONSTRAINT valid_domain_or_subdomain CHECK (domain IS NOT NULL OR subdomain IS NOT NULL)
);

-- Domain routing table for fast lookup
CREATE TABLE public.tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT false,
    ssl_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, is_primary) WHERE is_primary = true
);

-- Indexes for performance
CREATE INDEX idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX idx_tenants_domain ON public.tenants(domain);
CREATE INDEX idx_tenants_status ON public.tenants(status);
CREATE INDEX idx_tenant_domains_domain ON public.tenant_domains(domain);
```

#### 1.2 Tenant Context Middleware

**Frontend Tenant Resolution:**
```typescript
// src/contexts/TenantContext.tsx
export interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Resolve tenant from domain/subdomain
  // Cache tenant info in React Query
  // Provide tenant context to entire app
};

// src/hooks/useTenant.ts
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
};
```

#### 1.3 Database Schema Updates

**Add tenant_id to all major tables:**
```sql
-- Add tenant_id to all core tables
ALTER TABLE public.members ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.companies ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.events ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.groups ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.news_articles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.resources ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.marketplace_items ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.opportunities ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.photo_galleries ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add indexes for tenant-based queries
CREATE INDEX idx_members_tenant_id ON public.members(tenant_id);
CREATE INDEX idx_companies_tenant_id ON public.companies(tenant_id);
CREATE INDEX idx_events_tenant_id ON public.events(tenant_id);
CREATE INDEX idx_groups_tenant_id ON public.groups(tenant_id);
CREATE INDEX idx_news_articles_tenant_id ON public.news_articles(tenant_id);
CREATE INDEX idx_resources_tenant_id ON public.resources(tenant_id);
CREATE INDEX idx_marketplace_items_tenant_id ON public.marketplace_items(tenant_id);
CREATE INDEX idx_opportunities_tenant_id ON public.opportunities(tenant_id);
CREATE INDEX idx_photo_galleries_tenant_id ON public.photo_galleries(tenant_id);
```

#### 1.4 Update RLS Policies for Tenant Isolation

```sql
-- Example: Members table RLS policy
DROP POLICY IF EXISTS "Members visible to authenticated users" ON public.members;
CREATE POLICY "Members visible within tenant" ON public.members
    FOR SELECT
    USING (
        tenant_id = (
            SELECT t.id FROM public.tenants t, public.tenant_domains td 
            WHERE td.tenant_id = t.id 
            AND td.domain = current_setting('app.current_tenant_domain', true)
        )
    );

-- Similar policies for all tables...
```

### Phase 2: Core Multi-Tenancy Features (Weeks 3-4)

#### 2.1 Frontend Tenant Integration

**Update React Query Keys:**
```typescript
// src/config/queryClient.ts - Updated query keys
export const queryKeys = {
  // Tenant-aware query keys
  companies: {
    all: (tenantId: string) => ['companies', tenantId] as const,
    lists: (tenantId: string) => [...queryKeys.companies.all(tenantId), 'list'] as const,
    list: (tenantId: string, filters: Record<string, any>) => 
      [...queryKeys.companies.lists(tenantId), filters] as const,
    detail: (tenantId: string, id: string) => 
      [...queryKeys.companies.all(tenantId), 'detail', id] as const,
  },
  // Similar patterns for all other entities...
};
```

**Update API Layers:**
```typescript
// src/features/companies/api/companiesApi.ts
class CompaniesAPI {
  private getTenantId(): string {
    const tenant = getCurrentTenant();
    if (!tenant) throw new Error('No tenant context available');
    return tenant.id;
  }

  async getCompanies(filters?: CompanyFilters) {
    const tenantId = this.getTenantId();
    // All queries now include tenant filter
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('tenant_id', tenantId)
      .match(filters || {});
    
    if (error) throw error;
    return data;
  }
}
```

#### 2.2 Settings System Enhancement

**Extend existing settings for per-tenant config:**
```sql
-- Add tenant_id to settings tables
ALTER TABLE public.application_settings ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.feature_toggles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Create tenant-specific settings
CREATE TABLE public.tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    data_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, category, setting_key)
);
```

#### 2.3 Tenant Onboarding Flow

**Registration and Setup:**
```typescript
// src/features/tenants/components/TenantRegistration.tsx
export const TenantRegistrationFlow = () => {
  // Step 1: Basic tenant info (name, subdomain)
  // Step 2: Admin user creation
  // Step 3: Initial configuration
  // Step 4: Payment/plan selection
  // Step 5: DNS setup guidance
};
```

### Phase 3: Domain Management & Routing (Weeks 5-6)

#### 3.1 Domain Resolution System

**Environment-based routing:**
```typescript
// src/utils/tenantResolver.ts
export const resolveTenantFromRequest = async (request: Request): Promise<Tenant | null> => {
  const hostname = request.headers.host;
  
  // Check for custom domain first
  let tenant = await getTenantByDomain(hostname);
  
  // Fall back to subdomain
  if (!tenant) {
    const subdomain = extractSubdomain(hostname);
    if (subdomain) {
      tenant = await getTenantBySubdomain(subdomain);
    }
  }
  
  return tenant;
};
```

#### 3.2 SSL and DNS Management

**Automated certificate management:**
```typescript
// Integration with services like Cloudflare or Let's Encrypt
export class SSLManager {
  async provisionCertificate(domain: string, tenantId: string) {
    // Automated SSL certificate provisioning
  }
  
  async updateDNSRecords(domain: string, tenantId: string) {
    // DNS record management
  }
}
```

#### 3.3 Branding and Customization

**Per-tenant themes:**
```typescript
// src/features/tenants/hooks/useTenantTheme.ts
export const useTenantTheme = () => {
  const { tenant } = useTenant();
  
  return useMemo(() => ({
    primaryColor: tenant?.branding?.primaryColor || '#3B82F6',
    secondaryColor: tenant?.branding?.secondaryColor || '#6B7280',
    logo: tenant?.branding?.logo || '/default-logo.png',
    favicon: tenant?.branding?.favicon || '/default-favicon.ico',
    fontFamily: tenant?.branding?.fontFamily || 'Inter',
  }), [tenant]);
};
```

### Phase 4: Migration and Launch (Weeks 7-8)

#### 4.1 Data Migration Strategy

**Migrate existing Nelson Tech data:**
```sql
-- Create first tenant for existing data
INSERT INTO public.tenants (name, slug, subdomain, status, owner_user_id)
VALUES ('Nelson Tech Community', 'nelson-tech', 'nelson-tech', 'active', 
        (SELECT id FROM auth.users WHERE email = 'admin@nelsontech.ca' LIMIT 1));

-- Get the tenant ID
SET LOCAL app.nelson_tech_tenant_id = (SELECT id FROM public.tenants WHERE slug = 'nelson-tech');

-- Update all existing data with tenant_id
UPDATE public.members SET tenant_id = current_setting('app.nelson_tech_tenant_id')::uuid;
UPDATE public.companies SET tenant_id = current_setting('app.nelson_tech_tenant_id')::uuid;
UPDATE public.events SET tenant_id = current_setting('app.nelson_tech_tenant_id')::uuid;
-- Continue for all tables...
```

#### 4.2 Tenant Provisioning Automation

**Automated tenant setup:**
```typescript
// src/features/tenants/services/TenantProvisioningService.ts
export class TenantProvisioningService {
  async createTenant(params: CreateTenantParams): Promise<Tenant> {
    // 1. Create tenant record
    // 2. Set up initial admin user
    // 3. Create default settings
    // 4. Set up storage buckets
    // 5. Configure initial feature flags
    // 6. Send welcome email
    // 7. Set up monitoring
  }
  
  async destroyTenant(tenantId: string): Promise<void> {
    // Safe tenant data removal
  }
}
```

#### 4.3 Super Admin Dashboard

**Platform management interface:**
```typescript
// src/features/admin/pages/TenantsManagementPage.tsx
export const TenantsManagementPage = () => {
  // Tenant list with metrics
  // Usage statistics
  // Billing information
  // Support tools
  // System health monitoring
};
```

## Technical Considerations

### Performance Optimization

1. **Database Indexing:**
   - All queries include tenant_id in WHERE clauses
   - Composite indexes on (tenant_id, other_common_filters)
   - Partition tables by tenant_id for large datasets

2. **Caching Strategy:**
   - Tenant-specific cache namespaces
   - CDN configuration per domain
   - React Query cache invalidation by tenant

3. **Connection Pooling:**
   - Tenant-aware connection routing
   - Connection pool per tenant tier

### Security Measures

1. **Data Isolation:**
   - Row Level Security (RLS) at database level
   - API-level tenant validation
   - Frontend route protection

2. **Access Control:**
   - Tenant-scoped authentication
   - Cross-tenant access prevention
   - Admin role isolation

3. **Monitoring:**
   - Per-tenant usage tracking
   - Security audit logs
   - Anomaly detection

### Scaling Considerations

1. **Infrastructure:**
   - Horizontal scaling capabilities
   - Database sharding strategies
   - CDN and edge computing

2. **Storage:**
   - Tenant-specific storage buckets
   - File access controls
   - Backup strategies

3. **Monitoring:**
   - Per-tenant metrics
   - Resource usage tracking
   - Performance monitoring

## Migration Roadmap

### Week 1-2: Foundation
- [ ] Create tenant management system
- [ ] Implement domain resolution
- [ ] Update database schema
- [ ] Create tenant context

### Week 3-4: Core Features  
- [ ] Frontend tenant integration
- [ ] Settings system enhancement
- [ ] Onboarding flow
- [ ] API updates

### Week 5-6: Domains & Customization
- [ ] Domain management
- [ ] SSL automation
- [ ] Branding system
- [ ] Custom themes

### Week 7-8: Launch Preparation
- [ ] Data migration
- [ ] Admin dashboard
- [ ] Monitoring setup
- [ ] Documentation

## Success Metrics

1. **Technical:**
   - 99.9% uptime per tenant
   - <200ms average response time
   - Zero cross-tenant data leaks

2. **Business:**
   - Successful migration of Nelson Tech
   - First new tenant onboarded
   - Admin tools functional

3. **User Experience:**
   - Seamless user experience
   - Custom branding working
   - All features functional per tenant

## Risk Mitigation

1. **Data Safety:**
   - Comprehensive backup strategy
   - Rollback procedures
   - Data validation scripts

2. **Performance:**
   - Load testing with multiple tenants
   - Database performance monitoring
   - Caching validation

3. **Security:**
   - Security audit of tenant isolation
   - Penetration testing
   - Access control verification

## Future Enhancements

### Phase 2 Features (Post-Launch)
- Tenant analytics dashboard
- White-label mobile apps
- Advanced billing integration
- Multi-region deployment
- API marketplace for integrations
- Tenant-to-tenant data sharing (opt-in)

### Enterprise Features
- Single Sign-On (SSO) integration
- Advanced compliance tools
- Custom feature development
- Dedicated infrastructure options
- Priority support channels

## Conclusion

This multi-tenant architecture plan leverages the existing sophisticated foundation of the Kootenay Tech Community platform. The current settings system, permission architecture, and modular design make this transition highly feasible with manageable risk.

The phased approach ensures continuous functionality while building robust multi-tenancy capabilities. Each phase builds upon the previous, allowing for iterative testing and refinement.

**Estimated Timeline:** 8 weeks
**Risk Level:** Low-Medium (leveraging existing patterns)
**Expected Outcome:** Production-ready multi-tenant SaaS platform

---

*This document will be updated as implementation progresses and requirements evolve.*