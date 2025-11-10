# Nelson Tech Community Platform Documentation

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } __Getting Started__

    ---

    Set up your development environment and start contributing

    [:octicons-arrow-right-24: Quick Start](README.md)
    [:octicons-arrow-right-24: Contributing](../CONTRIBUTING.md)

-   :material-tools:{ .lg .middle } __Architecture__

    ---

    Learn about the hybrid state management and project structure

    [:octicons-arrow-right-24: Hybrid State Management](architecture/HYBRID_STATE_MANAGEMENT.md)
    [:octicons-arrow-right-24: Project Structure](architecture/PROJECT_STRUCTURE.md)

-   :material-book-open-variant:{ .lg .middle } __Development Guides__

    ---

    Comprehensive guides for building features and patterns

    [:octicons-arrow-right-24: Hybrid Pattern Guide](guides/HYBRID_PATTERN_GUIDE.md)
    [:octicons-arrow-right-24: API Structure](guides/API_STRUCTURE.md)

-   :material-puzzle:{ .lg .middle } __Features__

    ---

    Feature-specific documentation for all platform capabilities

    [:octicons-arrow-right-24: Gallery System](features/gallery/)
    [:octicons-arrow-right-24: Groups](features/groups/)
    [:octicons-arrow-right-24: Menu System](features/menu/)

-   :material-cloud-upload:{ .lg .middle } __Deployment__

    ---

    Deploy to production with confidence

    [:octicons-arrow-right-24: Deployment Guide](DEPLOYMENT_GUIDE.md)
    [:octicons-arrow-right-24: Platform Guides](deployment/)

-   :material-briefcase:{ .lg .middle } __Business Strategy__

    ---

    AI roadmap, SaaS planning, and business model

    [:octicons-arrow-right-24: AI Strategy](business/AI_STRATEGY_PLAN.md)
    [:octicons-arrow-right-24: SaaS Business Plan](business/SAAS_BUSINESS_PLAN.md)

</div>

## Welcome to Nelson Tech

A sophisticated React-based community platform connecting tech professionals in the Nelson/Kootenay region through networking, events, marketplace, and resources. Built with enterprise-grade architecture patterns and designed for scale.

### :star: Latest Updates (November 2025)

!!! success "Production-Ready Open Source Release"
    - ✅ **Security Hardened** - CRITICAL vulnerabilities fixed, XSS protection with DOMPurify
    - ✅ **Code Quality Enhanced** - 5,000+ lines refactored, large files split into modular components
    - ✅ **Type Safety Improved** - Eliminated 31+ `any` types across codebase
    - ✅ **Error Boundaries Added** - Graceful failure handling for 6 critical features
    - ✅ **Documentation Reorganized** - Feature-based structure with comprehensive guides

### :sparkles: Key Features

=== "Community Features"

    - **Member Directory** - Professional networking with advanced privacy controls
    - **Companies** - Company profiles with employee associations
    - **Events** - Community events with RSVP and calendar integration
    - **Groups** - Complete group management with roles and permissions
    - **News** - Community blog with article management
    - **Photo Galleries** - Rich media system with batch upload

=== "Professional Tools"

    - **Marketplace** - Buy/sell/trade with image galleries
    - **Opportunities** - Job postings and volunteer work
    - **Resources** - Educational content library
    - **Newsletter** - Campaign management with analytics
    - **Messaging** - Real-time communication between members

=== "Enterprise Grade"

    - **Privacy-First Onboarding** - 5-step guided wizard
    - **Advanced Role System** - Three-level permissions
    - **Modern UI/UX** - Responsive design with dark mode
    - **Rich Text Editor** - Tiptap-based with AI assistance
    - **Theme System** - Complete visual customization
    - **Admin Dashboard** - Professional management interface

### :compass: Navigation Guide

<div class="annotate" markdown>

!!! tip "Essential Reading for New Developers"
    1. **[CLAUDE.md](../CLAUDE.md)** - Development guidelines and SPARC methodology (1)
    2. **[Hybrid Pattern Guide](guides/HYBRID_PATTERN_GUIDE.md)** - Complete implementation guide
    3. **[Project Structure](architecture/PROJECT_STRUCTURE.md)** - Codebase organization
    4. **[Feature Development](guides/feature-development.md)** - Development workflow

</div>

1. :star: **START HERE** - This is the most important document for understanding our development approach

### :rocket: Technology Stack

**Frontend**
:   React 18, TypeScript 5.5, Vite 5, Tailwind CSS

**State Management**
:   React Query + Redux Toolkit (Hybrid Architecture)

**Backend**
:   Supabase (PostgreSQL, Auth, Storage, Real-time)

**Testing**
:   Jest, React Testing Library, Playwright (E2E)

**Content**
:   BlockNote (AI-enhanced, TipTap-based)

### :books: Documentation Sections

Browse documentation by category:

| Section | Description | Quick Links |
|---------|-------------|-------------|
| **Architecture** | System design and patterns | [Hybrid State](architecture/HYBRID_STATE_MANAGEMENT.md) · [Project Structure](architecture/PROJECT_STRUCTURE.md) |
| **Guides** | Development and implementation guides | [Hybrid Pattern](guides/HYBRID_PATTERN_GUIDE.md) · [API Structure](guides/API_STRUCTURE.md) |
| **Features** | Feature-specific documentation | [Gallery](features/gallery/) · [Groups](features/groups/) · [Menu](features/menu/) |
| **Components** | UI component library | [Patterns](components/common-patterns.md) · [Forms](components/form-components.md) |
| **Deployment** | Production deployment | [Main Guide](DEPLOYMENT_GUIDE.md) · [Platforms](deployment/) |
| **Business** | Strategy and planning | [AI Strategy](business/AI_STRATEGY_PLAN.md) · [SaaS Plan](business/SAAS_BUSINESS_PLAN.md) |

### :handshake: Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) and [Code of Conduct](../CODE_OF_CONDUCT.md).

### :lock: Security

Found a security vulnerability? Please see our [Security Policy](../SECURITY.md) for responsible disclosure.

---

!!! info "Documentation Updates"
    Last major reorganization: **November 10, 2025**
    Documentation structure moved to feature-based organization for better discoverability.

**Built with :heart: for the Nelson Tech Community**

*Connecting innovation in the Kootenays*
