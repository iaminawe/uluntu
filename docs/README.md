# Nelson Tech Community Platform Documentation

This is the primary documentation directory for the Nelson Tech Community Platform. Here you'll find comprehensive guides, architectural documentation, and implementation details.

## 📅 Last Updated: 2025-06-23

### Recent Major Updates
- **Gallery System**: Complete photo gallery implementation with batch upload
- **Newsletter System**: Campaign management with analytics
- **Settings System**: Dynamic superadmin configuration
- **Hybrid State Architecture**: Full migration to React Query + Redux UI slices

## 📁 Documentation Structure

### Core Documentation
- [`README.md`](README.md) - This file, documentation overview
- [`CLAUDE.md`](../CLAUDE.md) - **ESSENTIAL**: Development guidelines and architectural patterns (READ THIS FIRST)
- [`DOCUMENTATION_MAP.md`](DOCUMENTATION_MAP.md) - Complete documentation index
- [`API_STRUCTURE.md`](API_STRUCTURE.md) - API layer organization and patterns

### Architecture Documentation
- [`architecture/`](architecture/) - System architecture and design patterns
  - [`HYBRID_STATE_MANAGEMENT.md`](architecture/HYBRID_STATE_MANAGEMENT.md) - Complete state management guide
  - [`admin-redux-migration-report.md`](architecture/admin-redux-migration-report.md) - Admin system migration
- [`patterns/`](patterns/) - Code patterns and templates
- [`migrations/`](migrations/) - Migration guides and upgrade paths
  - [`REDUX_TO_HYBRID_MIGRATION_GUIDE.md`](migrations/REDUX_TO_HYBRID_MIGRATION_GUIDE.md) - Migration patterns

### Feature Documentation
- [`gallery/`](gallery/) - Photo gallery system documentation
  - [`PHOTO_GALLERY_IMPLEMENTATION.md`](gallery/PHOTO_GALLERY_IMPLEMENTATION.md) - Gallery implementation guide
- [`newsletter/`](../features/newsletter/) - Newsletter system documentation
- [`onboarding/`](onboarding/) - User onboarding system documentation
- [`admin/`](../features/admin/) - Admin system features
- [`api/`](api/) - API documentation and specifications
- [`components/`](components/) - Component library and UI patterns
- [`deployment/`](deployment/) - Deployment guides for various platforms

### Development Guides
- [`guides/`](guides/) - Step-by-step development guides
- [`development/`](development/) - Development best practices
  - [`HYBRID_HOOK_IMPLEMENTATION_GUIDE.md`](development/HYBRID_HOOK_IMPLEMENTATION_GUIDE.md) - Hook implementation patterns
- [`requirements/`](requirements/) - Feature requirements and specifications
- [`implementation/`](implementation/) - Implementation summaries and details

### Research and Reports
- [`research/`](research/) - Research reports and findings
- [`qa-reports/`](qa-reports/) - Quality assurance and validation reports
- [`swarm-outputs/`](swarm-outputs/) - AI agent collaboration outputs
- [`archive/`](archive/) - Historical documentation
- [`memory/`](memory/) - Session and agent memory tracking

## 🚀 Quick Start for Developers

### Essential Reading Order
1. **First**: [`CLAUDE.md`](../CLAUDE.md) - Development guidelines and patterns
2. **Second**: [`HYBRID_STATE_MANAGEMENT.md`](architecture/HYBRID_STATE_MANAGEMENT.md) - State management architecture
3. **Third**: [`HYBRID_HOOK_IMPLEMENTATION_GUIDE.md`](development/HYBRID_HOOK_IMPLEMENTATION_GUIDE.md) - Implementation patterns
4. **Then**: [`guides/feature-development.md`](guides/feature-development.md) - Feature development workflow

### Key Architectural Decisions
- **State Management**: React Query for server state, Redux for UI state only
- **Component Pattern**: Hybrid hooks combining React Query + Redux UI slices
- **File Structure**: Feature-based organization
- **Testing**: Jest + React Testing Library
- **Build**: Vite with code splitting

## 📚 Key Documentation Links

### Core Systems
- **Gallery System**: [`GALLERY_SYSTEM.md`](GALLERY_SYSTEM.md) - Complete gallery documentation
- **Settings System**: [`implementation/super-admin-settings/`](implementation/super-admin-settings/) - Dynamic configuration
- **Newsletter System**: Campaign management and analytics
- **Storage Architecture**: [`STORAGE_ARCHITECTURE.md`](STORAGE_ARCHITECTURE.md) - File storage patterns

### Development Resources
- **Development Setup**: See main [`README.md`](../README.md#-quick-start)
- **Contributing Guidelines**: Follow patterns in [`CLAUDE.md`](../CLAUDE.md)
- **Testing Strategy**: Review test patterns in feature directories
- **Deployment**: Check [`deployment/README.md`](deployment/README.md)

### Migration & Updates
- **Hybrid Migration**: [`HYBRID_MIGRATION_GUIDE.md`](HYBRID_MIGRATION_GUIDE.md)
- **Error Handling**: [`ERROR_HANDLING_GUIDE.md`](ERROR_HANDLING_GUIDE.md)
- **Performance**: Check qa-reports for performance baselines

## 🔄 Documentation Maintenance

When adding new features or making architectural changes:

1. **Update [`CLAUDE.md`](../CLAUDE.md)** with new patterns (CRITICAL)
2. Update relevant documentation in the appropriate directory
3. Add implementation summaries to `/implementation`
4. Create QA reports in `/qa-reports` for validation
5. Keep [`DOCUMENTATION_MAP.md`](DOCUMENTATION_MAP.md) current
6. Archive outdated documentation in `/archive` with date stamps
7. Update this README if adding new documentation categories

## 📊 Documentation Coverage Status

### Well Documented ✅
- Gallery System
- Hybrid State Architecture
- Settings System
- Newsletter System
- Onboarding Flow

### Needs Updates 🔄
- Groups System (recent enhancements)
- Contact Submissions
- Performance Monitoring

### Planned Documentation 📝
- Advanced Permission System
- Batch Operations
- Real-time Features

## 📖 Key Concepts

### Feature-Based Architecture
The project uses a feature-based architecture where each feature is self-contained with its own:
- Components
- Hooks (Hybrid pattern)
- API calls (React Query)
- State management (Redux UI slices)
- Types
- Tests

### SPARC Methodology
We use SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) for systematic development:
1. **Specification** - Define requirements
2. **Pseudocode** - Plan logic and flow
3. **Architecture** - Design structure
4. **Refinement** - Implement with TDD
5. **Completion** - Integrate and document

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **State Management**: React Query + Redux Toolkit (Hybrid)
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel/Netlify/Cloudflare

---

Last updated: June 2025