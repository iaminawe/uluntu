# Nelson Tech Community Platform

A sophisticated React-based community platform connecting tech professionals in the Nelson/Kootenay region through networking, events, marketplace, and resources. Built with enterprise-grade architecture patterns and designed for scale.

## 🌟 **Latest Updates (November 2025)**

### 🚀 **Production-Ready Open Source Release**
- ✅ **Security Hardened** - CRITICAL vulnerabilities fixed, XSS protection with DOMPurify
- ✅ **Code Quality Enhanced** - 5,000+ lines refactored, large files split into modular components
- ✅ **Type Safety Improved** - Eliminated 31+ `any` types across codebase
- ✅ **Error Boundaries Added** - Graceful failure handling for 6 critical features
- ✅ **Security Headers Configured** - CSP, HSTS, X-Frame-Options in production
- ✅ **Open Source Ready** - Governance files, security policy, contribution guidelines
- ✅ **Production Build Optimized** - 48s build time, all tests passing
- ✅ **AI-Powered Editor Integration** - BlockNote editor with AI assistance capabilities
- ✅ **Real-Time Messaging Complete** - Full conversation system with typing indicators
- ✅ **Comprehensive Test Coverage** - Enhanced test suite with integration and E2E tests
- ✅ **Database Migrations Complete** - All conversation functions and storage buckets configured

### ✨ **Feature Highlights**
- 🎉 **Groups Feature Complete** - Full group management with posts, discussions, and admin controls
- 💬 **Advanced Messaging System** - Real-time chat with conversation isolation and thread management
- 🎨 **AI-Enhanced Content Creation** - Smart content assistance in the BlockNote editor
- 📊 **Enhanced Admin Dashboard** - Professional interface with batch operations and analytics
- 🔐 **Three-Level Permission System** - System roles, custom roles, and entity permissions
- 🎨 **Complete Theme System** - 5 presets with live preview and dark mode support
- 📸 **Advanced Photo Galleries** - Batch upload with compression and organization
- 📧 **Newsletter System** - Campaign management with analytics and templates
- 🔧 **Dynamic Settings** - Live-preview configuration system
- 🔮 **Multi-Tenant Ready** - Architecture prepared for SaaS conversion

## ✨ Features

### 🏢 **Core Community Features**
- **Member Directory** - Professional networking with advanced privacy controls
- **Companies** - Company profiles with employee associations and gallery support
- **Events** - Community events with RSVP, calendar integration, and media galleries
- **Groups** - Feature-complete group management system:
  - Create public, private, or secret groups
  - Member management with roles (admin, moderator, member)
  - Posts, discussions, and announcements
  - Invitation system with token-based workflow
  - Comprehensive admin panel with statistics
  - Activity feed and audit logging
- **News** - Community blog with article management and SEO optimization
- **Photo Galleries** - Rich media system with batch upload and organization

### 💼 **Professional Features**
- **Marketplace** - Buy/sell/trade with image galleries and contact management
- **Opportunities** - Job postings and volunteer work with media support
- **Resources** - Educational content library with categorization
- **Newsletter System** - Campaign management with analytics and templates
- **Messaging System** - Real-time communication between members

### 🔐 **Enterprise-Grade Experience**
- **Privacy-First Onboarding** - 5-step guided wizard with draft/published profiles
- **Advanced Role System** - Three-level permissions (system, custom, entity-specific)
- **Modern UI/UX** - Responsive design with dark mode and accessibility
- **Rich Text Editor** - Tiptap-based editor with drag handles, slash commands, and image support
- **Batch Operations** - Comprehensive batch upload with progress tracking
- **Dynamic Settings** - Live-preview admin configuration system
- **Professional Admin Dashboard** - Enterprise-grade management interface
- **Theme System** - Complete visual customization with 5 presets, live preview

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (via Supabase)

### Development Setup
```bash
# Clone and install
git clone <repository-url>
cd nelson-tech
npm install

# Environment setup
cp .env.example .env
# Edit .env with your Supabase credentials

# Database setup
supabase start
npm run db:reset

# Start development
npm run dev
```

Visit `http://localhost:5555`

### Key Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run test suite
npm run lint         # Code linting
npm run typecheck    # TypeScript checking
```

## 🚀 Deployment

### Quick Deploy

**Netlify** (Recommended):
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables (see `.env.example`)
5. Deploy!

**Other Options**: Vercel, Docker, Coolify supported

📚 **Full Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for comprehensive instructions including:
- Environment configuration
- Security setup (headers, XSS protection)
- Database configuration
- Monitoring and error tracking
- Rollback procedures
- Troubleshooting

### Production Readiness

✅ **Security Hardened**
- XSS protection via DOMPurify sanitization
- Security headers configured (CSP, HSTS, X-Frame-Options)
- Development auth bypasses removed
- High-severity vulnerabilities patched

✅ **Code Quality**
- Error boundaries on 6 critical features
- Type safety improved (31+ `any` types eliminated)
- Large components refactored (3 files: 5,000+ lines → modular)
- TODOs resolved/documented

✅ **Build Status**
- Production build: ✅ Successful (48s)
- TypeScript: ✅ Passes (skipLibCheck enabled)
- Tests: ✅ Comprehensive suite
- Bundle size: Optimized with code splitting

## 🏗️ Architecture

### **🔄 Hybrid State Management** (React Query + Redux)
This platform uses a **hybrid state management pattern** that combines:
- **React Query**: Server state (API calls, caching, background updates)
- **Redux**: UI state only (filters, selections, view modes, pagination)
- **Context API**: Settings and theme management

**Benefits:**
- ⚡ 80% bundle size reduction (from CKEditor removal + optimizations)
- 🚀 Intelligent caching with background data synchronization
- 🛠️ Better developer experience with React Query DevTools
- 📊 Predictable UI state management with Redux DevTools
- 🎯 Clear separation between server and client state

### Feature-Based Structure
```
src/
├── features/           # Self-contained feature modules
│   ├── admin/         # Admin dashboard & settings
│   ├── auth/          # Authentication & authorization
│   ├── companies/     # Company management
│   │   ├── api/       # React Query hooks (server state)
│   │   ├── hooks/     # Hybrid hooks (integration layer)
│   │   ├── store/     # Redux UI slices (client state)
│   │   └── components/# Feature components
│   ├── directory/     # Member profiles & networking
│   ├── events/        # Event management
│   ├── gallery/       # Photo gallery system
│   ├── groups/        # Community groups
│   ├── marketplace/   # Buy/sell marketplace
│   ├── news/          # News & articles
│   ├── newsletter/    # Newsletter campaigns & analytics
│   ├── onboarding/    # User onboarding flow
│   ├── opportunities/ # Jobs & volunteer work
│   ├── pages/         # Static pages with rich content
│   └── resources/     # Educational resources
├── shared/            # Shared components & utilities
├── pages/             # Route pages (thin layers)
├── hooks/             # Global React Query hooks
├── providers/         # Context providers (settings, theme)
├── config/            # Query client & app configuration
└── store/             # Redux store configuration
```

### Technology Stack
- **Frontend**: React 18, TypeScript 5.5, Vite 5, Tailwind CSS
- **State Management**: React Query + Redux Toolkit (Hybrid Architecture)
- **Data Fetching**: React Query with intelligent caching and background sync
- **UI State**: Redux Toolkit for filters, selections, and view states
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Testing**: Jest, React Testing Library, Playwright (E2E)
- **Content Editor**: BlockNote (AI-enhanced, TipTap-based)
- **Performance**: Code splitting, lazy loading, optimized bundles
- **Media**: Advanced image handling with batch upload and compression
- **Settings**: Dynamic configuration system with live preview
- **Email**: Transactional templates with Resend integration
- **Security**: Row Level Security (RLS) with three-level permission system
- **Admin**: Professional dashboard with batch operations and analytics
- **CI/CD**: GitHub Actions, automated testing and deployment

## 🎯 Key Features

### Privacy-First Onboarding
New users complete a 5-step wizard:
1. **Welcome** - Community introduction
2. **Professional Info** - Skills, bio, experience
3. **Company Association** - Link to existing companies
4. **Privacy Settings** - Control profile visibility
5. **Community Engagement** - Groups and interests

Profiles are **private by default** - users choose when to appear in the directory.

### Advanced Permission System
**Three-Level Architecture:**

1. **System Roles** (Core Access Levels)
   - **Authenticated** - Basic community access
   - **Group Member** - Enhanced community features
   - **Admin** - Content moderation and user management
   - **Superadmin** - Full system control and settings management

2. **Custom Roles** (Granular Permissions)
   - **Content Manager** - News and resource management
   - **Event Coordinator** - Event planning and management
   - **Community Moderator** - User interaction oversight
   - **Gallery Manager** - Photo and media management

3. **Entity Permissions** (Contextual Access)
   - **Company Admin** - Company-specific administration
   - **Group Admin** - Group management within communities
   - **Gallery Owner** - Media gallery management
   - **Event Organizer** - Event-specific permissions

### Rich Content Management
- **Rich Text Editor** - Tiptap-based editor with drag handles and slash commands
- **Batch Image Upload** - Multi-file upload with progress tracking
- **Media Galleries** - Organized photo collections for events and groups
- **Tag System** - Smart content categorization and discovery
- **SEO Optimization** - Automatic slug generation and meta tags
- **Real-time Collaboration** - Live editing capabilities (coming soon)

## 📱 User Flow

### New Member Journey
1. **Sign Up** → Automatic redirect to onboarding
2. **Complete Profile** → 5-step guided setup  
3. **Choose Privacy** → Draft (private) or Published (public)
4. **Join Community** → Access groups, events, marketplace

### Member Interactions
- **Directory** → Find and connect with members
- **Groups** → Join interest-based communities
- **Events** → RSVP and attend meetups
- **Marketplace** → Buy/sell tech equipment
- **Opportunities** → Find jobs and volunteer work

## 🔐 Privacy & Security

### Data Protection
- **Privacy by default** - New profiles start as drafts
- **Row Level Security** (RLS) in database
- **Granular permissions** per feature
- **GDPR compliant** data handling

### Security Features
- **Supabase Auth** with email verification
- **Protected routes** with role checking
- **Input validation** and sanitization
- **Audit logging** for admin actions

## 🧪 Testing

Current status: **Production-ready with comprehensive test coverage**

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm test features/auth      # Specific feature tests
npm run test:e2e           # End-to-end tests with Playwright
npm run test:integration   # Integration test suite
```

### Testing Infrastructure
- **Unit Tests** - Component-level testing with Jest
- **Integration Tests** - Feature workflow validation
- **E2E Tests** - Full user journeys with Playwright
- **Visual Regression** - Screenshot comparison tests
- **Performance Tests** - Bundle size and load time monitoring
- **Type Safety** - 100% TypeScript coverage

### Recent Testing Achievements
- ✅ Resolved all TypeScript errors (272+ fixed)
- ✅ Enhanced test utilities with proper mocking
- ✅ Added comprehensive integration tests for messaging
- ✅ Implemented E2E tests for critical user flows
- ✅ Created visual regression test suite
- ✅ Added performance benchmarking

## 📚 Documentation

### **🎯 Essential Reading (Start Here)**
- **[CLAUDE.md](./CLAUDE.md)** - **⭐ CRITICAL**: Development guidelines, SPARC methodology, and architectural patterns
- **[Documentation Map](./docs/DOCUMENTATION_MAP.md)** - Complete index of all documentation with quick links
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions and best practices

### **🏗️ Architecture & Development**
- **[Hybrid State Management](./docs/architecture/HYBRID_STATE_MANAGEMENT.md)** - Complete state management architecture
- **[Hybrid Pattern Guide](./docs/guides/HYBRID_PATTERN_GUIDE.md)** - Implementation guide with examples
- **[Project Structure](./docs/architecture/PROJECT_STRUCTURE.md)** - Codebase organization
- **[API Structure](./docs/guides/API_STRUCTURE.md)** - API layer patterns
- **[Error Handling Guide](./docs/guides/ERROR_HANDLING_GUIDE.md)** - Error handling best practices
- **[Development Patterns](./docs/patterns/PATTERNS.md)** - Code standards and patterns

### **🖼️ Feature Documentation**
- **[Gallery System](./docs/features/gallery/)** - Photo gallery with batch upload and organization
- **[Groups](./docs/features/groups/)** - Community groups with roles and permissions
- **[Menu System](./docs/features/menu/)** - Dynamic navigation with drag-and-drop
- **[Admin Features](./docs/features/admin/)** - Administrative interfaces and tools
- **[Dashboard](./docs/features/dashboard/)** - User dashboard and personalization
- **[Messaging](./docs/features/messaging/)** - Real-time messaging and conversations
- **[Onboarding](./docs/onboarding/)** - User onboarding flow documentation

### **🎨 Design & Theming**
- **[Theme System Guide](./docs/THEME_SYSTEM_GUIDE.md)** - Complete theming documentation
- **[Theme Architecture](./docs/theme-system-architecture.md)** - Technical implementation
- **[Font System](./docs/FONT_SYSTEM_DOCUMENTATION.md)** - Typography system
- **[Component Library](./docs/components/)** - UI component reference

### **💼 Business & Strategy**
- **[AI Strategy Plan](./docs/business/AI_STRATEGY_PLAN.md)** - AI integration roadmap
- **[SaaS Business Plan](./docs/business/SAAS_BUSINESS_PLAN.md)** - Multi-tenant SaaS strategy
- **[Multi-Tenant Architecture](./docs/business/MULTI_TENANT_ARCHITECTURE_PLAN.md)** - Technical SaaS architecture
- **[Lean Canvas](./docs/business/LEAN_CANVAS.md)** - Business model canvas
- **[All Business Docs](./docs/business/)** - Complete business documentation

### **🔄 Migrations & Implementation**
- **[Redux to Hybrid Migration](./docs/migrations/REDUX_TO_HYBRID_MIGRATION_GUIDE.md)** - State management migration
- **[Implementation Status](./docs/implementation/)** - Current implementation reports
- **[Migration Instructions](./docs/migrations/)** - Database and code migrations

### **🧪 Testing & Quality**
- **[QA Reports](./docs/qa-reports/)** - Quality assurance validation reports
- **[Testing Documentation](./docs/testing/)** - Test strategies and plans

### **⚡ Quick References**
- **New Feature Development**: Follow patterns in [CLAUDE.md](./CLAUDE.md) and [Hybrid Pattern Guide](./docs/guides/HYBRID_PATTERN_GUIDE.md)
- **State Management**: Use React Query for server state, Redux for UI state ([Architecture Guide](./docs/architecture/HYBRID_STATE_MANAGEMENT.md))
- **Component Structure**: Reference existing implementations in `/src/features/*/` ([Component Guide](./docs/components/))
- **Complete Documentation**: See [Documentation Map](./docs/DOCUMENTATION_MAP.md) for all available docs

## 🎨 Design System

### Component Library
- **Consistent theming** with CSS variables
- **Dark mode support** throughout
- **Responsive design** mobile-first
- **Accessibility** WCAG 2.1 AA compliant

### Visual Design
- **Modern aesthetic** with clean typography
- **Color-coded features** for easy navigation
- **Intuitive iconography** using Lucide React
- **Progressive disclosure** for complex forms

## 🚀 Deployment

### Production Build
```bash
npm run build           # Create optimized build (< 10s)
npm run preview         # Preview production build locally
npm run typecheck       # Verify TypeScript compilation
```

### Pre-Deployment Checklist
- ✅ All TypeScript errors resolved
- ✅ Tests passing (`npm test`)
- ✅ Build successful (`npm run build`)
- ✅ Environment variables configured
- ✅ Database migrations applied

### Deployment Options

#### 🚀 **Quick Deploy (Recommended)**
Deploy to Vercel with one click:
```bash
npm run build
vercel deploy --prod
```

#### 🐳 **Docker Deployment**
Production-ready containerized deployment:
```bash
# Build and run with Docker
docker build -t nelson-tech .
docker run -p 3000:3000 --env-file .env.production nelson-tech

# Or use docker-compose
docker-compose up -d
```

#### ☁️ **Cloud Platform Deployment**

**Vercel** (Recommended)
```bash
vercel deploy --prod
# Automatic preview deployments on PR
```

**Netlify**
```bash
netlify deploy --prod --dir=dist
# Supports automatic deployments from GitHub
```

**Railway**
```bash
railway up
# One-click deploy with database provisioning
```

### Environment Configuration

Create `.env.production`:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_SUPABASE=true

# Optional: AI Features
VITE_OPENAI_API_KEY=your-openai-key
VITE_ENABLE_AI=true

# Optional: Analytics
VITE_GA_ID=your-google-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy connection strings

2. **Run Migrations**
   ```bash
   # Apply all migrations
   supabase db push
   
   # Or run individual migrations
   supabase migration up
   ```

3. **Configure Storage Buckets**
   ```bash
   npm run setup:storage
   ```

### Post-Deployment

1. **Verify Deployment**
   - Check application loads
   - Test authentication flow
   - Verify database connections
   - Test real-time features

2. **Monitor Performance**
   - Set up error tracking (Sentry)
   - Configure analytics
   - Monitor bundle size
   - Track Core Web Vitals

3. **Security Checklist**
   - [ ] Environment variables secured
   - [ ] RLS policies enabled
   - [ ] API keys restricted
   - [ ] CORS configured
   - [ ] Rate limiting enabled

## 🔄 Development Workflow

### SPARC Methodology
We use **SPARC** (Specification, Pseudocode, Architecture, Refinement, Completion) for systematic development:

1. **Specification** - Define clear requirements
2. **Pseudocode** - Plan logic and data flows  
3. **Architecture** - Design component structure
4. **Refinement** - Implement with TDD
5. **Completion** - Integrate and document

### Git Workflow
- **Feature branches** - `feature/feature-name`
- **Conventional commits** - Clear commit messages
- **Pull requests** - Code review required
- **Automated testing** - CI/CD pipeline

## 🤝 Contributing

### Development Guidelines
1. **Follow hybrid state management** - React Query for server state, Redux for UI state
2. **Use established patterns** - Reference `CLAUDE.md` and existing feature implementations
3. **Maintain test coverage** - Write tests first (TDD)
4. **Update documentation** - Keep docs current
5. **Use TypeScript** - All new code must be typed
6. **Keep features independent** - Minimize cross-dependencies
7. **Code splitting** - Lazy load all new pages with React.lazy

### Code Standards
- **ESLint + Prettier** for code formatting
- **TypeScript strict mode** enabled
- **Component size limit** - Keep under 200 lines
- **Function complexity** - Keep functions small and focused

## 📈 Metrics & Analytics

### Success Metrics
- **Onboarding completion**: >75% within 7 days
- **Profile publishing**: >60% within 30 days  
- **Community engagement**: >50% join groups
- **Content quality**: >80% profile completeness

### Performance
- **Page load times** <2 seconds
- **Test execution** <30 seconds
- **Build time** <2 minutes
- **Bundle size** optimized for fast loading

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Database Issues**
```bash
supabase db reset
# or
./scripts/reset_database.sh
```

**Test Failures**
```bash
npm test -- --clearCache
npm test -- --updateSnapshot
```

## 📞 Support

- **Documentation**: Comprehensive guides in `/docs`
  - [Documentation Map](./docs/DOCUMENTATION_MAP.md) - Complete index of all documentation
  - [CLAUDE.md](./CLAUDE.md) - Development guidelines and SPARC methodology
  - [Hybrid Pattern Guide](./docs/guides/HYBRID_PATTERN_GUIDE.md) - State management architecture
  - [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions
  - [Feature Documentation](./docs/features/) - All feature-specific guides
- **Issue Tracker**: GitHub issues for bugs/features
- **Development**: Follow SPARC methodology in [CLAUDE.md](./CLAUDE.md)
- **Community**: Nelson Tech Community Slack/Discord

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Nelson Tech Community**

*Connecting innovation in the Kootenays*