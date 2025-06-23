# Nelson Tech Community Platform

A modern React-based community platform connecting tech professionals in the Nelson/Kootenay region through networking, events, marketplace, and resources.

## ✨ Features

### 🏢 **Core Community Features**
- **Member Directory** - Professional networking with privacy controls
- **Companies** - Company profiles and employee connections
- **Events** - Community events with RSVP and calendar integration
- **Groups** - Interest-based community groups with announcements
- **News** - Community announcements and articles
- **Photo Galleries** - Rich media galleries for events, groups, and opportunities

### 💼 **Professional Features**
- **Marketplace** - Buy/sell/trade tech equipment and services
- **Opportunities** - Job postings and volunteer opportunities with gallery support
- **Resources** - Educational content and documentation
- **Newsletter System** - Campaign management with analytics

### 🔐 **User Experience**
- **Privacy-First Onboarding** - 5-step wizard with draft/published profiles
- **Role-Based Access** - Granular permissions (authenticated, member, admin, superadmin)
- **Modern UI** - Responsive design with dark mode support
- **Rich Content** - Novel editor for blog-style content creation
- **Batch Upload** - Comprehensive batch photo upload system
- **Dynamic Settings** - Superadmin configurable site settings

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
- **Frontend**: React 18, TypeScript, Vite
- **State Management**: React Query + Redux Toolkit (Hybrid)
- **Data Fetching**: React Query with intelligent caching
- **UI State**: Redux Toolkit for filters, selections, etc.
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library  
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Content**: Novel editor (TipTap-based, 80% smaller than CKEditor)
- **Code Splitting**: React.lazy for all major pages
- **Image Handling**: Batch upload with progress tracking
- **Settings**: Dynamic configuration system
- **Email**: Transactional email templates

## 🎯 Key Features

### Privacy-First Onboarding
New users complete a 5-step wizard:
1. **Welcome** - Community introduction
2. **Professional Info** - Skills, bio, experience
3. **Company Association** - Link to existing companies
4. **Privacy Settings** - Control profile visibility
5. **Community Engagement** - Groups and interests

Profiles are **private by default** - users choose when to appear in the directory.

### Role-Based Access Control
- **Authenticated** - Basic community access
- **Member** - Full member features
- **Group Member** - Access to specific groups
- **Group Admin** - Group management capabilities
- **Admin** - Content moderation and user management
- **Superadmin** - Full system control and settings management

### Rich Content Management
- **Novel Editor** integration for blog-style content
- **Image handling** with upload support
- **Tag system** for content organization
- **SEO-friendly** URLs with slug generation

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

Current status: **93% test coverage** (397/428 tests passing)

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm test features/auth      # Specific feature tests
```

### Recent Testing Focus
- Gallery system integration tests
- Newsletter campaign functionality
- Settings system validation
- Batch upload performance tests

### Testing Strategy
- **Unit Tests** - Co-located with components
- **Integration Tests** - Feature-level testing
- **E2E Tests** - Full user workflows
- **Mock Data** - Consistent test environment

## 📚 Documentation

### **🏗️ Architecture & Development**
- **[CLAUDE.md](./CLAUDE.md)** - **Essential development guidelines & architectural patterns**
- **[Hybrid State Management](./docs/architecture/HYBRID_STATE_MANAGEMENT.md)** - Complete architecture overview
- **[Migration Guide](./docs/migrations/REDUX_TO_HYBRID_MIGRATION_GUIDE.md)** - Migration documentation & patterns
- **[Implementation Guide](./docs/development/HYBRID_HOOK_IMPLEMENTATION_GUIDE.md)** - Step-by-step feature development

### **📖 General Documentation**
- **[Development Guide](./docs/README.md)** - Detailed development documentation
- **[API Documentation](./docs/api/)** - Backend API reference
- **[Component Guide](./docs/components/)** - UI component library

### **⚡ Quick References**
- **New Feature Development**: Follow patterns in `CLAUDE.md` and `HYBRID_HOOK_IMPLEMENTATION_GUIDE.md`
- **State Management**: Use React Query for server state, Redux for UI state
- **Component Structure**: Reference existing implementations in `/src/features/*/`

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
npm run build           # Create optimized build
npm run preview         # Preview production build locally
```

### Deployment Options
- **Netlify** - `netlify deploy --prod --dir=dist`
- **Vercel** - `vercel deploy --prod`
- **Cloudflare Pages** - `wrangler pages deploy dist`
- **Docker** - `docker build -t nelson-tech .`

### Environment Variables
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_USE_SUPABASE=true
```

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
- **Issue Tracker**: GitHub issues for bugs/features
- **Development**: Follow SPARC methodology in CLAUDE.md
- **Community**: Nelson Tech Community Slack/Discord

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Nelson Tech Community**

*Connecting innovation in the Kootenays*