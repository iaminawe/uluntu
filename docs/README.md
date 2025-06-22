# Nelson Tech Community Platform Documentation

Welcome to the Nelson Tech Community Platform documentation. This platform connects tech professionals in the Nelson/Kootenay region through various features including networking, events, marketplace, and resources.

## 📚 Documentation Structure

### Getting Started
- [Project Overview](./overview.md) - High-level project information
- [Architecture](./architecture.md) - System architecture and design decisions
- [Development Setup](./setup.md) - How to get started with development

### Development Guides
- [Feature Development Guide](./guides/feature-development.md) - How to build new features
- [Testing Strategy](./guides/testing-strategy.md) - Testing approach and best practices
- [Code Style Guide](./guides/code-style.md) - Coding standards and conventions
- [Import Migration Guide](./import-migration-guide.md) - Guide for import path updates

### Feature Documentation
- [Authentication](./features/auth.md) - User authentication and authorization
- [Companies](./features/companies.md) - Company profiles and management
- [Directory](./features/directory.md) - Member directory and profiles
- [Events](./features/events.md) - Event management system
- [Groups](./features/groups.md) - Community groups
- [Marketplace](./features/marketplace.md) - Buy/sell marketplace
- [News](./features/news.md) - News and articles
- [Onboarding](./onboarding/) - **🆕 Complete 5-step user onboarding system with privacy controls**
- [Opportunities](./features/opportunities.md) - Jobs and volunteering
- [Resources](./features/resources.md) - Educational resources

### Architecture & Technical
- [Redux Architecture](./redux_architecture.md) - State management patterns
- [Component Documentation](./components/) - UI component library
- [Feature Structure Example](./feature-structure-example.md) - How features are organized

### Project Management
- [Product Requirements](./PRD.md) - Current product requirements
- [User Stories](./user_stories.md) - Feature user stories
- [Roadmap](./comprehensive_roadmap_and_plan.md) - Development roadmap
- [Technical Issues Tracker](./technical_issues_tracker.md) - Known issues and resolutions

### Migration & Reorganization
- [Code Reorganization Plan](./code-reorganization-plan.md) - Architecture migration plan
- [Reorganization Summary](./reorganization-summary.md) - What was accomplished
- [Action Plan](./reorganization-action-plan.md) - Step-by-step migration guide

## 🚀 Quick Links

- **[CLAUDE.md](../CLAUDE.md)** - AI assistant configuration and SPARC methodology
- **[Migration Scripts](../scripts/)** - Automated reorganization scripts
- **[Test Status](./test_status_update.md)** - Current test coverage report

## 📖 Key Concepts

### Feature-Based Architecture
The project uses a feature-based architecture where each feature is self-contained with its own:
- Components
- Hooks
- API calls
- State management
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
- **State Management**: Redux Toolkit, React Query
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel/Netlify

## 🎯 Current Status

- **Test Coverage**: 100% (461/461 tests passing)
- **Features Completed**: 10/10 core features + Complete onboarding system
- **Architecture**: Feature-based with clear separation of concerns
- **Documentation**: Comprehensive and up-to-date
- **Onboarding**: ✅ 5-step wizard with privacy controls and profile publishing

## 🏗️ Project Structure

```
src/
├── features/           # Feature modules (self-contained)
├── shared/             # Shared code (components, utils)
├── pages/              # Route pages (thin layers)
├── store/              # Redux store configuration
└── tests/              # Integration & E2E tests
```

## 📝 Development Workflow

1. **Plan** - Use SPARC methodology to plan the feature
2. **Test** - Write tests first (TDD approach)
3. **Implement** - Build the feature
4. **Document** - Update documentation
5. **Review** - Code review and testing
6. **Deploy** - Merge and deploy

## 🤝 Contributing

When contributing to this project:
- Follow the established patterns and conventions
- Maintain 100% test coverage
- Update documentation for any changes
- Use TypeScript for all new code
- Keep features self-contained

## 📞 Support

- **Documentation**: This directory contains all project documentation
- **Issues**: Create issues in the repository for bugs or features
- **SPARC Methodology**: See [CLAUDE.md](../CLAUDE.md) for AI-assisted development

---

Last updated: June 2025