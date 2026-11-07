# Frequently Asked Questions (FAQ)

Common questions about the Nelson Tech Community Platform.

---

## General Questions

### What is Nelson Tech Community Platform?

A sophisticated React-based community platform designed to connect tech professionals in the Nelson/Kootenay region. It includes features like member directories, groups, events, marketplace, photo galleries, and real-time messaging.

### Is this production-ready?

Yes! As of November 2025, the platform is production-ready with:
- ✅ Security hardened (XSS protection, security headers)
- ✅ Type-safe TypeScript implementation
- ✅ Comprehensive error boundaries
- ✅ Production build optimized
- ✅ Full test coverage

### What's the tech stack?

- **Frontend**: React 18, TypeScript 5.5, Vite 5, Tailwind CSS
- **State**: React Query + Redux Toolkit (Hybrid)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Testing**: Jest, React Testing Library, Playwright

---

## Setup & Installation

### What are the minimum requirements?

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (via Supabase)
- Modern web browser

### How do I get started?

See our **[Quick Start Guide](Quick-Start)** for step-by-step setup instructions.

### Do I need a Supabase account?

Yes, the platform uses Supabase for:
- PostgreSQL database
- Authentication
- File storage
- Real-time features

You can sign up for free at [supabase.com](https://supabase.com).

### Can I use a different database?

The platform is built for Supabase/PostgreSQL. While technically possible to adapt to other databases, it would require significant changes to:
- Authentication system
- Row Level Security (RLS) policies
- Storage system
- Real-time subscriptions

---

## Development

### Where do I start coding?

1. Read [CLAUDE.md](../CLAUDE.md) - Development patterns
2. Review [Hybrid Pattern Guide](https://iaminawe.github.io/nelson-tech/guides/HYBRID_PATTERN_GUIDE/)
3. Check existing features in `/src/features/`
4. Follow the established patterns

### What's the hybrid state management pattern?

We use a hybrid approach:
- **React Query** - Server state (API calls, caching)
- **Redux** - UI state only (filters, selections, view modes)
- **Context API** - Settings and theme

Benefits: Better performance, clearer separation, optimal caching.

See: [Hybrid State Management Docs](https://iaminawe.github.io/nelson-tech/architecture/HYBRID_STATE_MANAGEMENT/)

### How do I add a new feature?

Write the requirements first, build on a feature branch with tests, then integrate and document.

See: [Feature Development Guide](https://iaminawe.github.io/nelson-tech/guides/feature-development/)

### Where should I put my code?

Follow the feature-based structure:

```
src/features/my-feature/
├── api/           # React Query hooks
├── hooks/         # Hybrid hooks
├── store/         # Redux slices
├── components/    # React components
└── types/         # TypeScript types
```

### How do I run tests?

```bash
npm test                    # All tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm run test:e2e           # E2E tests
```

---

## Features

### What features are included?

**Community:**
- Member directory with privacy controls
- Groups with roles and permissions
- Events with RSVP and galleries
- Company profiles

**Professional:**
- Marketplace for buying/selling
- Job opportunities board
- Newsletter system
- Real-time messaging

**Admin:**
- User management
- Content moderation
- Theme customization
- Settings management

### Can users upload photos?

Yes! The gallery system supports:
- Batch photo upload
- Automatic compression
- Album organization
- Privacy controls
- Mobile-optimized viewing

See: [Gallery Documentation](https://iaminawe.github.io/nelson-tech/features/gallery/)

### How does the permission system work?

Three-level architecture:

1. **System Roles** - authenticated, group_member, admin, superadmin
2. **Custom Roles** - content_manager, event_coordinator, etc.
3. **Entity Permissions** - company_admin, group_admin, gallery_owner

See: [Role Management](https://iaminawe.github.io/nelson-tech/architecture/role-management-requirements-analysis/)

### Is there a dark mode?

Yes! The theme system supports:
- Light/dark mode toggle
- 5 preset themes
- Complete customization
- Live preview

Admins can customize colors, fonts, and spacing.

---

## Deployment

### How do I deploy to production?

See our comprehensive [Deployment Guide](https://iaminawe.github.io/nelson-tech/DEPLOYMENT_GUIDE/).

Quick options:
- **Netlify** (Recommended) - One-click deploy
- **Vercel** - Simple deployment
- **Docker** - Containerized deployment
- **Coolify** - Self-hosted option

### What environment variables do I need?

Minimum required:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_USE_SUPABASE=true
```

Optional:
```env
VITE_OPENAI_API_KEY=your-key  # For AI features
VITE_ENABLE_AI=true
```

### How do I handle database migrations?

```bash
# Apply all migrations
supabase db push

# Or run specific migration
supabase migration up
```

Migrations are in `/supabase/migrations/` directory.

### What about security?

The platform includes:
- ✅ XSS protection (DOMPurify)
- ✅ Security headers (CSP, HSTS)
- ✅ Row Level Security (RLS)
- ✅ Input validation
- ✅ Audit logging

See: [Security Policy](../SECURITY.md)

---

## Customization

### Can I customize the theme?

Yes! Admins can:
- Choose from 5 preset themes
- Customize colors, fonts, spacing
- Upload logos and branding
- Live preview changes

See: [Theme System Guide](https://iaminawe.github.io/nelson-tech/THEME_SYSTEM_GUIDE/)

### Can I add custom features?

Absolutely! The platform is designed to be extensible:

1. Follow the established patterns
2. Use the feature-based structure
3. Maintain hybrid state management
4. Write tests
5. Document your feature

See: [Development Patterns](https://iaminawe.github.io/nelson-tech/patterns/PATTERNS/)

### How do I modify the menu?

The platform has a drag-and-drop menu management system:
- Hierarchical structure
- Role-based visibility
- Internationalization support
- Audit trails

See: [Menu System](https://iaminawe.github.io/nelson-tech/features/menu/)

---

## Troubleshooting

### Build is failing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

See: [Troubleshooting Guide](Troubleshooting)

### TypeScript errors

```bash
# Run type checking
npm run typecheck

# Some libraries may require skipLibCheck: true in tsconfig.json
```

### Tests are failing

```bash
# Clear cache
npm test -- --clearCache

# Update snapshots if needed
npm test -- --updateSnapshot
```

### Database connection issues

- Verify `.env` configuration
- Check Supabase project is active
- Ensure RLS policies are applied
- Test connection in Supabase dashboard

---

## Performance

### How fast is the build?

- **Development**: Instant (Vite HMR)
- **Production**: ~48 seconds
- **Tests**: ~30 seconds

### What's the bundle size?

Optimized with:
- Code splitting
- Lazy loading
- Tree shaking
- Minification

Target: < 500KB initial load (gzipped)

### How does it scale?

The platform is designed for scale:
- React Query caching reduces API calls
- Optimistic updates for instant UI
- Lazy loading for large lists
- Database indexes for fast queries
- Multi-tenant ready architecture

---

## Multi-Tenancy & SaaS

### Is this multi-tenant ready?

The architecture is prepared for multi-tenancy conversion. See:
- [Multi-Tenant Architecture Plan](https://iaminawe.github.io/nelson-tech/business/MULTI_TENANT_ARCHITECTURE_PLAN/)
- [SaaS Business Plan](https://iaminawe.github.io/nelson-tech/business/SAAS_BUSINESS_PLAN/)

### What's the AI roadmap?

Comprehensive AI integration planned:
- AI-powered content recommendations
- Smart search and discovery
- Automated moderation
- Content generation assistance

See: [AI Strategy Plan](https://iaminawe.github.io/nelson-tech/business/AI_STRATEGY_PLAN/)

---

## Community & Support

### How can I contribute?

See our [Community Guide](Community-Guide) and [CONTRIBUTING.md](../CONTRIBUTING.md).

Ways to contribute:
- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests
- Help others in discussions

### Where can I get help?

- **[Troubleshooting Guide](Troubleshooting)** - Common issues
- **[Development Tips](Development-Tips)** - Helpful tricks
- **GitHub Issues** - Report bugs
- **GitHub Discussions** - Ask questions
- **Documentation** - [MkDocs Site](https://iaminawe.github.io/nelson-tech/)

### Is there a community?

Join the Nelson Tech Community:
- GitHub Discussions
- Slack/Discord (coming soon)
- Local meetups in Nelson, BC

---

## License & Legal

### What's the license?

MIT License - See [LICENSE](../LICENSE) file.

You are free to:
- Use commercially
- Modify
- Distribute
- Use privately

### Can I use this for my own community?

Yes! This is open source. You can:
- Fork the repository
- Customize for your community
- Deploy your own instance
- Contribute improvements back

---

## Still Have Questions?

- **[Troubleshooting](Troubleshooting)** - Solve problems
- **[Development Tips](Development-Tips)** - Helpful tricks
- **[Full Documentation](https://iaminawe.github.io/nelson-tech/)** - Technical docs
- **GitHub Issues** - Ask specific questions
- **GitHub Discussions** - Community discussion

---

**Previous**: [Quick Start](Quick-Start) | **Next**: [Troubleshooting](Troubleshooting)
