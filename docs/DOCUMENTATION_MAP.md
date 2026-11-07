# Nelson Tech Documentation Map

## Overview
This document provides a comprehensive map of all documentation in the Nelson Tech project after the 2025-11-10 reorganization and cleanup.

## Documentation Structure

### 📂 Root Level Documentation
- **[README.md](../README.md)** - Project overview and quick start guide
- **[CLAUDE.md](../CLAUDE.md)** - **ESSENTIAL**: Development guidelines and architectural patterns
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history and release notes
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)** - Community code of conduct
- **[SECURITY.md](../SECURITY.md)** - Security policy and vulnerability reporting

### 📁 Core Documentation Directories

#### 🏗️ Architecture (`/docs/architecture/`)
- **[HYBRID_STATE_MANAGEMENT.md](architecture/HYBRID_STATE_MANAGEMENT.md)** - **CORE**: Complete state management guide
- **[PROJECT_STRUCTURE.md](architecture/PROJECT_STRUCTURE.md)** - Project organization and structure
- **[README.md](architecture/README.md)** - Architecture overview
- **[admin-redux-migration-report.md](architecture/admin-redux-migration-report.md)** - Admin system migration
- **[api-consolidation-audit.md](architecture/api-consolidation-audit.md)** - API structure analysis
- **[best-practices-research-report.md](architecture/best-practices-research-report.md)** - Research findings
- **[role-management-requirements-analysis.md](architecture/role-management-requirements-analysis.md)** - Role system requirements

#### 📖 Development Guides (`/docs/guides/`)
- **[HYBRID_PATTERN_GUIDE.md](guides/HYBRID_PATTERN_GUIDE.md)** - **CORE**: Complete hybrid implementation guide
- **[API_STRUCTURE.md](guides/API_STRUCTURE.md)** - API layer organization and patterns
- **[ERROR_HANDLING_GUIDE.md](guides/ERROR_HANDLING_GUIDE.md)** - Error handling patterns
- **[HYBRID_MIGRATION_GUIDE.md](guides/HYBRID_MIGRATION_GUIDE.md)** - Migration to hybrid state pattern
- **[QUICK_REFERENCE.md](guides/QUICK_REFERENCE.md)** - Quick reference for developers
- **[STANDARD_FORM_INTEGRATION_GUIDE.md](guides/STANDARD_FORM_INTEGRATION_GUIDE.md)** - Form integration patterns
- **[feature-development.md](guides/feature-development.md)** - Feature development workflow

#### 🚀 Deployment (`/docs/deployment/`)
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - **PRIMARY**: Production deployment guide
- **[README.md](deployment/README.md)** - Deployment overview
- **[netlify.md](deployment/netlify.md)** - Netlify deployment
- **[DOCKER_TROUBLESHOOTING.md](deployment/DOCKER_TROUBLESHOOTING.md)** - Docker deployment issues
- **[COOLIFY_DEPLOYMENT.md](deployment/COOLIFY_DEPLOYMENT.md)** - Coolify deployment guide
- **[COOLIFY_MINIMAL_DEPLOYMENT.md](deployment/COOLIFY_MINIMAL_DEPLOYMENT.md)** - Minimal Coolify setup
- **[COOLIFY_ROUTING_FIX.md](deployment/COOLIFY_ROUTING_FIX.md)** - Routing configuration fixes
- **[COOLIFY_SERVER_TROUBLESHOOTING.md](deployment/COOLIFY_SERVER_TROUBLESHOOTING.md)** - Server troubleshooting
- **[coolify.md](deployment/coolify.md)** - General Coolify guide

#### 🔧 Implementation (`/docs/implementation/`)
- **[README.md](implementation/README.md)** - Implementation overview
- **[HYBRID_PATTERN_COMPLETION_2025_06_23.md](implementation/HYBRID_PATTERN_COMPLETION_2025_06_23.md)** - Hybrid pattern completion
- **[IMPLEMENTATION_STATUS_2025_06_23.md](implementation/IMPLEMENTATION_STATUS_2025_06_23.md)** - Implementation status snapshot

##### Contact Submissions (`/docs/implementation/contact-submissions/`)
- **[api-implementation.md](implementation/contact-submissions/api-implementation.md)** - API endpoints
- **[schema-design.md](implementation/contact-submissions/schema-design.md)** - Database schema

##### Email Integration (`/docs/implementation/email-integration/`)
- **[integration-summary.md](implementation/email-integration/integration-summary.md)** - Email integration overview
- **[notification-system-implementation.md](implementation/email-integration/notification-system-implementation.md)** - Email notifications

##### Super Admin Settings (`/docs/implementation/super-admin-settings/`)
- **[implementation.md](implementation/super-admin-settings/implementation.md)** - Core implementation
- **[implementation-summary.md](implementation/super-admin-settings/implementation-summary.md)** - Implementation summary
- **[improvement-plan.md](implementation/super-admin-settings/improvement-plan.md)** - Future improvements
- **[improvements-summary.md](implementation/super-admin-settings/improvements-summary.md)** - Recent improvements

#### 🖼️ Features (`/docs/features/`)

##### Gallery System (`/docs/features/gallery/`) ⭐
- **[README.md](features/gallery/README.md)** - Gallery system overview
- **[GALLERY_SYSTEM.md](features/gallery/GALLERY_SYSTEM.md)** - **CANONICAL**: Complete gallery documentation
- **[GALLERY_API_REFERENCE.md](features/gallery/GALLERY_API_REFERENCE.md)** - Gallery API documentation
- **[GALLERY_DEPLOYMENT_GUIDE.md](features/gallery/GALLERY_DEPLOYMENT_GUIDE.md)** - Gallery deployment
- **[GALLERY_MOBILE_GUIDE.md](features/gallery/GALLERY_MOBILE_GUIDE.md)** - Mobile gallery features
- **[PHOTO_GALLERY_COMPLETE.md](features/gallery/PHOTO_GALLERY_COMPLETE.md)** - Gallery implementation guide
- **[PHOTO_GALLERY_DATABASE_SCHEMA.md](features/gallery/PHOTO_GALLERY_DATABASE_SCHEMA.md)** - Database schema
- **[PHOTO_GALLERY_IMPLEMENTATION.md](features/gallery/PHOTO_GALLERY_IMPLEMENTATION.md)** - Implementation details
- **[PHOTO_GALLERY_SEED_DATA_DOCUMENTATION.md](features/gallery/PHOTO_GALLERY_SEED_DATA_DOCUMENTATION.md)** - Seed data

##### Groups Feature (`/docs/features/groups/`) 🆕
- **[README.md](features/groups/README.md)** - Groups system overview
- **[API.md](features/groups/API.md)** - Groups API reference
- **[DEPLOYMENT.md](features/groups/DEPLOYMENT.md)** - Deployment guide
- **[IMPLEMENTATION_STATUS.md](features/groups/IMPLEMENTATION_STATUS.md)** - Implementation status

##### Menu System (`/docs/features/menu/`) 🆕
- **[README.md](features/menu/README.md)** - **COMPREHENSIVE**: Menu system documentation
- **[ANALYSIS.md](features/menu/ANALYSIS.md)** - System analysis
- **[SECURITY.md](features/menu/SECURITY.md)** - Security implementation
- **[API_TYPE_FIXES.md](features/menu/API_TYPE_FIXES.md)** - TypeScript types
- **[TOGGLE_SYSTEM.md](features/menu/TOGGLE_SYSTEM.md)** - Toggle functionality
- **[DRAG_DROP.md](features/menu/DRAG_DROP.md)** - Drag-and-drop implementation

##### Admin Features (`/docs/features/admin/`) 🆕
- **[README.md](features/admin/README.md)** - Admin features overview
- **Gallery Management** (`gallery/`)
  - **[MANAGEMENT_SYSTEM.md](features/admin/gallery/MANAGEMENT_SYSTEM.md)** - Admin gallery interface
  - **[IMPLEMENTATION_PLAN.md](features/admin/gallery/IMPLEMENTATION_PLAN.md)** - Implementation roadmap
  - **[DATABASE_SCHEMA.sql](features/admin/gallery/DATABASE_SCHEMA.sql)** - Gallery schema
- **User Management** (`users/`)
  - **[GUIDE.md](features/admin/users/GUIDE.md)** - User management guide
  - **[ENHANCEMENT.md](features/admin/users/ENHANCEMENT.md)** - User management enhancements

##### Dashboard (`/docs/features/dashboard/`) 🆕
- **[README.md](features/dashboard/README.md)** - Dashboard overview
- **[COMPONENT_SPECS.md](features/dashboard/COMPONENT_SPECS.md)** - Component specifications
- **[ARCHITECTURE.md](features/dashboard/ARCHITECTURE.md)** - Dashboard architecture
- **[IMPLEMENTATION_GUIDE.md](features/dashboard/IMPLEMENTATION_GUIDE.md)** - Implementation guide
- **[API.md](features/dashboard/API.md)** - Dashboard API reference

##### Messaging System (`/docs/features/messaging/`) 🆕
- **[README.md](features/messaging/README.md)** - Messaging system overview
- **[CONVERSATIONS_TESTING.md](features/messaging/CONVERSATIONS_TESTING.md)** - Testing strategy
- **[CONVERSATION_DELETION.md](features/messaging/CONVERSATION_DELETION.md)** - Deletion implementation
- **[FLOW_ANALYSIS.md](features/messaging/FLOW_ANALYSIS.md)** - Message flow analysis
- **[SYSTEM_FIX.md](features/messaging/SYSTEM_FIX.md)** - System fixes

#### 🧩 Components (`/docs/components/`)
- **[README.md](components/README.md)** - Component overview
- **[common-patterns.md](components/common-patterns.md)** - Common component patterns
- **[error-handling.md](components/error-handling.md)** - Error handling in components
- **[form-components.md](components/form-components.md)** - Form component documentation
- **[form-functionality-analysis.md](components/form-functionality-analysis.md)** - Form analysis
- **[layout.md](components/layout.md)** - Layout component guidelines
- **[loading-states.md](components/loading-states.md)** - Loading state patterns
- **[page-components.md](components/page-components.md)** - Page component documentation

#### 🔄 Migrations (`/docs/migrations/`)
- **[README.md](migrations/README.md)** - Migration overview
- **[REDUX_TO_HYBRID_MIGRATION_GUIDE.md](migrations/REDUX_TO_HYBRID_MIGRATION_GUIDE.md)** - Redux to hybrid migration
- **[CONTACT_SETTINGS_MIGRATION.md](migrations/CONTACT_SETTINGS_MIGRATION.md)** - Contact settings migration
- **[migration-instructions.md](migrations/migration-instructions.md)** - General migration instructions
- **[safe-migration-instructions.md](migrations/safe-migration-instructions.md)** - Safe migration practices

#### 🎨 Patterns (`/docs/patterns/`)
- **[README.md](patterns/README.md)** - Patterns overview
- **[PATTERNS.md](patterns/PATTERNS.md)** - **CORE**: Development patterns and standards
- **[MIGRATION-GUIDE.md](patterns/MIGRATION-GUIDE.md)** - Pattern migration guide
- **[eslint-custom-rules.js](patterns/eslint-custom-rules.js)** - Custom linting rules

##### Templates (`/docs/patterns/templates/`)
- **[api-service-template.ts](patterns/templates/api-service-template.ts)** - API service template
- **[component-template.tsx](patterns/templates/component-template.tsx)** - React component template
- **[component-types-template.ts](patterns/templates/component-types-template.ts)** - Component types template
- **[hook-template.ts](patterns/templates/hook-template.ts)** - Custom hook template
- **[redux-slice-template.ts](patterns/templates/redux-slice-template.ts)** - Redux slice template
- **[test-template.test.tsx](patterns/templates/test-template.test.tsx)** - Test template

#### 🎨 Theme System (`/docs/`)
- **[THEME_SYSTEM_GUIDE.md](THEME_SYSTEM_GUIDE.md)** - User guide for theme customization
- **[theme-system-architecture.md](theme-system-architecture.md)** - Technical architecture and implementation
- **[FONT_SYSTEM_DOCUMENTATION.md](FONT_SYSTEM_DOCUMENTATION.md)** - Font system guide
- **[ULUNTU_BRAND_STRATEGY.md](ULUNTU_BRAND_STRATEGY.md)** - Brand guidelines

#### 🧪 QA Reports (`/docs/qa-reports/`)
- **[README.md](qa-reports/README.md)** - QA overview
- **[gallery-system-validation-report.md](qa-reports/gallery-system-validation-report.md)** - Gallery validation
- **[live-data-verification-report.md](qa-reports/live-data-verification-report.md)** - Data verification
- **[performance-baseline-report.md](qa-reports/performance-baseline-report.md)** - Performance baselines
- **[performance-improvement-tracking.md](qa-reports/performance-improvement-tracking.md)** - Performance tracking
- **[qa-validation-report.md](qa-reports/qa-validation-report.md)** - General QA validation
- **[super-admin-settings-validation-report.md](qa-reports/super-admin-settings-validation-report.md)** - Admin settings validation

#### 🧭 Navigation (`/docs/navigation/`)
- **[NAVIGATION_AND_PAGES_SYSTEM.md](navigation/NAVIGATION_AND_PAGES_SYSTEM.md)** - Navigation system
- **[CHANGELOG_NAVIGATION_PAGES.md](navigation/CHANGELOG_NAVIGATION_PAGES.md)** - Navigation changes log
- **[QUICK_REFERENCE_NAVIGATION_PAGES.md](navigation/QUICK_REFERENCE_NAVIGATION_PAGES.md)** - Navigation quick reference

#### 🎓 Onboarding (`/docs/onboarding/`)
- **[ONBOARDING_SYSTEM_DOCUMENTATION.md](onboarding/ONBOARDING_SYSTEM_DOCUMENTATION.md)** - System documentation
- **[COMPLETE_ONBOARDING_IMPLEMENTATION.md](onboarding/COMPLETE_ONBOARDING_IMPLEMENTATION.md)** - Complete implementation
- **[IMPLEMENTATION_GUIDE.md](onboarding/IMPLEMENTATION_GUIDE.md)** - Implementation guide
- **[IMPLEMENTATION_SUMMARY.md](onboarding/IMPLEMENTATION_SUMMARY.md)** - Implementation summary
- **[phase_1_requirements.md](onboarding/phase_1_requirements.md)** - Phase 1 requirements
- **[phase_2_pseudocode.md](onboarding/phase_2_pseudocode.md)** - Phase 2 pseudocode
- **[phase_3_modules.md](onboarding/phase_3_modules.md)** - Phase 3 modules
- **[phase_4_testing.md](onboarding/phase_4_testing.md)** - Phase 4 testing

#### 💼 Business Strategy (`/docs/business/`) 🆕
- **[README.md](business/README.md)** - Business documentation overview

##### AI Strategy & Implementation
- **[AI_STRATEGY_PLAN.md](business/AI_STRATEGY_PLAN.md)** - Comprehensive AI roadmap
- **[AI_STRATEGY_IMPLEMENTATION_GUIDE.md](business/AI_STRATEGY_IMPLEMENTATION_GUIDE.md)** - Implementation details
- **[AI_EXECUTIVE_SUMMARY.md](business/AI_EXECUTIVE_SUMMARY.md)** - Executive summary
- **[AI_IMPLEMENTATION_ROADMAP.md](business/AI_IMPLEMENTATION_ROADMAP.md)** - Phased rollout plan
- **[AI_ASSISTANT_ARCHITECTURE.md](business/AI_ASSISTANT_ARCHITECTURE.md)** - AI assistant design
- **[AI_VECTOR_EMBEDDING_SPECIFICATION.md](business/AI_VECTOR_EMBEDDING_SPECIFICATION.md)** - Vector database spec
- **[AI_UI_UX_DESIGN_SPECIFICATION.md](business/AI_UI_UX_DESIGN_SPECIFICATION.md)** - AI UI/UX design
- **[AI_EDITOR_ANALYSIS_REPORT.md](business/AI_EDITOR_ANALYSIS_REPORT.md)** - Editor analysis
- **[AI_EDITOR_PERFORMANCE_RECOMMENDATIONS.md](business/AI_EDITOR_PERFORMANCE_RECOMMENDATIONS.md)** - Performance recommendations
- **[AI_EDITOR_TEST_STRATEGY.md](business/AI_EDITOR_TEST_STRATEGY.md)** - Testing strategy
- **[AI_COST_BENEFIT_ANALYSIS.md](business/AI_COST_BENEFIT_ANALYSIS.md)** - ROI analysis

##### SaaS & Multi-Tenancy
- **[SAAS_BUSINESS_PLAN.md](business/SAAS_BUSINESS_PLAN.md)** - SaaS business strategy
- **[MULTI_TENANT_ARCHITECTURE_PLAN.md](business/MULTI_TENANT_ARCHITECTURE_PLAN.md)** - Multi-tenant architecture

##### Business Planning
- **[LEAN_CANVAS.md](business/LEAN_CANVAS.md)** - Business model canvas
- **[PITCH_DECK_OUTLINE.md](business/PITCH_DECK_OUTLINE.md)** - Investor pitch structure

#### 🔬 Research (`/docs/research/`)
- **[github_template_research_report.md](research/github_template_research_report.md)** - GitHub template research

#### 🧪 Testing (`/docs/testing/`)
- **[menu-management-test-documentation.md](testing/menu-management-test-documentation.md)** - Menu testing

#### 🗂️ Archive (`/docs/archive/`)
Historical documentation organized by date:

##### 2025-11-10 Archive (`/docs/archive/2025-11-10/`) 🆕
- **deployment-fixes/** - Old Coolify and deployment troubleshooting docs
- **phase-reports/** - Completed phase documentation and old gallery docs
- **product-requirements/** - Historical PRD and planning documents

##### 2025-06-23 Archive (`/docs/archive/2025-06-23/`)
- **[CLEANUP_SUMMARY_2025_06_23.md](archive/2025-06-23/CLEANUP_SUMMARY_2025_06_23.md)** - Cleanup summary
- **[FINAL_CLEANUP_REPORT_2025_06_23.md](archive/2025-06-23/FINAL_CLEANUP_REPORT_2025_06_23.md)** - Final cleanup report
- **[FORM_STANDARDIZATION_COMPLETE.md](archive/2025-06-23/FORM_STANDARDIZATION_COMPLETE.md)** - Form standardization
- **[SWARM_DOCUMENTATION_SUMMARY_2025_06_23.md](archive/2025-06-23/SWARM_DOCUMENTATION_SUMMARY_2025_06_23.md)** - Swarm documentation

### 📝 Additional Root Documentation
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[TODO_RESOLUTION_REPORT.md](TODO_RESOLUTION_REPORT.md)** - TODO tracking
- **[TYPESCRIPT_RESOLUTION_REPORT.md](TYPESCRIPT_RESOLUTION_REPORT.md)** - TypeScript improvements
- **[NPM_VULNERABILITY_ANALYSIS.md](NPM_VULNERABILITY_ANALYSIS.md)** - Security analysis
- **[KNOWN_ISSUES_AND_LIMITATIONS.md](KNOWN_ISSUES_AND_LIMITATIONS.md)** - Known issues
- **[REMAINING_ISSUES_REPORT.md](REMAINING_ISSUES_REPORT.md)** - Outstanding issues
- **[ERROR_SANITIZATION_AUDIT.md](ERROR_SANITIZATION_AUDIT.md)** - Error handling audit
- **[FEATURE_TOGGLE_INVESTIGATION_REPORT.md](FEATURE_TOGGLE_INVESTIGATION_REPORT.md)** - Feature flags
- **[OPEN_SOURCE_RELEASE_RECOMMENDATIONS.md](OPEN_SOURCE_RELEASE_RECOMMENDATIONS.md)** - OSS preparation
- **[DATABASE_ARCHITECT_SUMMARY.md](DATABASE_ARCHITECT_SUMMARY.md)** - Database architecture
- **[STORAGE_ARCHITECTURE.md](STORAGE_ARCHITECTURE.md)** - Storage architecture
- **[SUPABASE_CONNECTION_VALIDATION.md](SUPABASE_CONNECTION_VALIDATION.md)** - Supabase validation
- **[SOCIAL_MEDIA_PLATFORM_SPECIFICATION.md](SOCIAL_MEDIA_PLATFORM_SPECIFICATION.md)** - Social features spec

### 💾 Database Documentation (`/database/`)
- **[README.md](../database/README.md)** - Database overview
- **[CLEANUP_SUMMARY.md](../database/CLEANUP_SUMMARY.md)** - Database cleanup summary
- **seeds/** - Seed data with documentation
- **menu-fixes/** - Menu system SQL fixes and migrations

### 🧪 Tests (`/tests/`)
- **[dashboard-crud-testing-plan.md](../tests/dashboard-crud-testing-plan.md)** - Dashboard testing plan
- **[dashboard-testing-implementation-summary.md](../tests/dashboard-testing-implementation-summary.md)** - Dashboard test summary
- **production-validation/** - Production validation reports

## 🚀 Quick Navigation for Developers

### Essential Reading Order
1. **[CLAUDE.md](../CLAUDE.md)** - **START HERE**: Development guidelines and patterns
2. **[guides/HYBRID_PATTERN_GUIDE.md](guides/HYBRID_PATTERN_GUIDE.md)** - Complete implementation guide
3. **[architecture/HYBRID_STATE_MANAGEMENT.md](architecture/HYBRID_STATE_MANAGEMENT.md)** - State management
4. **[patterns/PATTERNS.md](patterns/PATTERNS.md)** - Code patterns and standards
5. **[guides/feature-development.md](guides/feature-development.md)** - Development workflow

### Key System Documentation
- **Gallery System**: [features/gallery/GALLERY_SYSTEM.md](features/gallery/GALLERY_SYSTEM.md)
- **Groups Feature**: [features/groups/README.md](features/groups/README.md)
- **Menu System**: [features/menu/README.md](features/menu/README.md)
- **Admin Features**: [features/admin/README.md](features/admin/README.md)
- **Dashboard**: [features/dashboard/README.md](features/dashboard/README.md)
- **Messaging**: [features/messaging/README.md](features/messaging/README.md)
- **Admin Settings**: [implementation/super-admin-settings/implementation.md](implementation/super-admin-settings/implementation.md)
- **API Structure**: [guides/API_STRUCTURE.md](guides/API_STRUCTURE.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Development Resources
- **Component Patterns**: [components/common-patterns.md](components/common-patterns.md)
- **Error Handling**: [guides/ERROR_HANDLING_GUIDE.md](guides/ERROR_HANDLING_GUIDE.md)
- **Migration Guides**: [migrations/README.md](migrations/README.md)
- **Code Templates**: [patterns/templates/](patterns/templates/)
- **Testing Patterns**: [patterns/templates/test-template.test.tsx](patterns/templates/test-template.test.tsx)

### Business & Strategy
- **AI Strategy**: [business/AI_STRATEGY_PLAN.md](business/AI_STRATEGY_PLAN.md)
- **SaaS Planning**: [business/SAAS_BUSINESS_PLAN.md](business/SAAS_BUSINESS_PLAN.md)
- **Business Model**: [business/LEAN_CANVAS.md](business/LEAN_CANVAS.md)

## 📊 Documentation Organization Benefits

### ✅ Improvements Made (2025-11-10)
- **Feature-Based Organization**: All features now have dedicated folders with READMEs
- **Consolidated Scattered Docs**: Groups, Menu, Admin, Dashboard, Messaging docs centralized
- **Business Docs Separated**: AI and SaaS strategy moved to dedicated business folder
- **Reduced Redundancy**: Duplicate gallery, theme, and implementation docs archived
- **Cleaner Root**: Moved 16+ files out of docs/ root to appropriate subdirectories
- **Better Navigation**: Each feature folder has comprehensive README with cross-links
- **Historical Archive**: 2025-11-10 archive created for superseded documentation
- **Database Organization**: Menu SQL fixes moved to database/menu-fixes/

### 🎯 Key Features
- **Feature-Based Structure**: Gallery, Groups, Menu, Admin, Dashboard, Messaging
- **Business Strategy Section**: AI roadmap, SaaS planning, business model
- **Enhanced Guides Section**: All development guides centralized
- **Deployment Consolidation**: All deployment docs together
- **Archive System**: Dated historical documentation preserved
- **Clear Navigation**: Comprehensive map with quick links
- **Cross-Referencing**: READMEs link to related documentation

### 📈 Statistics
- **Previous Organization** (June 2025): ~186 files in /docs
- **Current Organization** (November 2025): ~180 files (better organized)
- **New Feature Folders**: 5 (groups, admin, dashboard, menu, messaging)
- **Files Archived**: 20+ (deployment fixes, phase reports, redundant docs)
- **Files Consolidated**: 15+ (moved to appropriate feature folders)
- **Business Docs Centralized**: 16 files moved to /docs/business/

---

Last updated: November 10, 2025
Previous update: June 26, 2025
