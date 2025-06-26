# Nelson Tech Community Platform - Project Structure

## 📁 Root Directory Organization

### Configuration Files
```
.
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App-specific TypeScript config
├── tsconfig.node.json      # Node-specific TypeScript config
├── vite.config.ts          # Vite bundler configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
├── jest.config.ts          # Jest testing configuration
├── .gitignore              # Git ignore patterns
├── .npmrc                  # NPM configuration
└── .env.example            # Environment variables template
```

### Documentation
```
├── README.md               # Project overview and setup
├── CLAUDE.md               # AI development guidelines
├── LICENSE                 # MIT License
└── PROJECT_STRUCTURE.md    # This file
```

### Deployment Files
```
├── docker-compose.yml              # Full-stack deployment
├── docker-compose.coolify.yml      # Coolify deployment
├── docker-compose.coolify-minimal.yml  # Minimal deployment
├── Dockerfile                      # Production Dockerfile
├── Dockerfile.minimal              # Minimal Dockerfile
├── nginx.conf                      # Nginx configuration
├── netlify.toml                    # Netlify deployment config
└── index.html                      # Main HTML entry point
```

## 📂 Directory Structure

### Source Code
```
src/
├── features/               # Feature-based modules (main architecture)
├── shared/                 # Shared components and utilities
├── pages/                  # Route page components
├── hooks/                  # Global React hooks
├── store/                  # Redux store configuration
├── config/                 # Application configuration
├── utils/                  # Global utilities
├── styles/                 # Global styles
├── types/                  # Global TypeScript types
├── providers/              # React context providers
├── services/               # External service integrations
├── test-utils/             # Testing utilities
├── tests/                  # Test files
├── App.tsx                 # Main app component
├── main.tsx                # Application entry point
└── types.ts                # Root type definitions
```

### Documentation
```
docs/
├── architecture/           # Architecture documentation
├── development/            # Development guides
├── api/                    # API documentation
├── components/             # Component documentation
├── migrations/             # Migration guides
├── COOLIFY_DEPLOYMENT.md   # Coolify deployment guide
├── COOLIFY_MINIMAL_DEPLOYMENT.md  # Minimal deployment guide
└── DOCKER_TROUBLESHOOTING.md     # Docker troubleshooting
```

### Database
```
database/
├── migrations/             # Database migrations
├── seeds/                  # Seed data
└── scripts/                # Database utilities
```

### Supabase
```
supabase/
├── migrations/             # Supabase migrations
├── functions/              # Edge functions
├── seed.sql                # Seed data
└── config.toml             # Supabase configuration
```

### Build & Distribution
```
dist/                       # Production build output
public/                     # Static assets
```

### Development Tools
```
scripts/                    # Build and utility scripts
tests/                      # Additional test files
sql-scripts/                # SQL utility scripts
```

### Hidden/Ignored Directories
```
.archive/                   # Archived files (gitignored)
.claude/                    # Claude Code configuration
.git/                       # Git repository
node_modules/               # NPM dependencies
memory/                     # Claude-flow memory
```

## 🗂️ Archived Files

The following have been moved to `.archive/` for cleanliness:
- Debug Docker files (docker-debug.sh, Dockerfile.debug)
- Test scripts (test-docker-fix.sh)
- Old reports (BUILD_VALIDATION_REPORT.md, IMPORT_FIXES_SUMMARY.md)
- Swarm session directories
- Duplicate config files (vite.config.performance.ts, jest.config.js)
- TypeScript build info (.tsbuildinfo)
- Test environment files (.env.test, .env.coolify-minimal)

## 🔑 Key Files to Know

1. **CLAUDE.md** - Essential development guidelines, MUST READ
2. **src/features/** - All feature code lives here
3. **docker-compose.yml** - Main deployment configuration
4. **.env.example** - Environment variable reference
5. **docs/** - All documentation

## 📋 Clean Root Directory

After cleanup, the root should only contain:
- Essential config files
- Documentation (README, LICENSE, etc.)
- Deployment files (Docker, compose)
- Package files (package.json, lock files)
- Entry points (index.html)

Everything else should be organized into appropriate directories.