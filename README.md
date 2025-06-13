# Nelson Tech Community Platform

A comprehensive platform connecting tech professionals in the Nelson/Kootenay region through networking, events, marketplace, and resources.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp config/.env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend)
- Git

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Redux Toolkit, React Query
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## 🏗️ Project Structure

```
src/
├── features/      # Feature-based modules
├── shared/        # Shared components, utils
├── pages/         # Route pages
├── store/         # Redux configuration
└── tests/         # Integration tests
```

## 📖 Documentation

See the [docs directory](./docs/README.md) for comprehensive documentation:

- [Project Overview](./docs/overview.md)
- [Quick Reference](./docs/quick-reference.md)
- [Feature Development Guide](./docs/guides/feature-development.md)
- [Architecture Documentation](./docs/architecture.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

Current test coverage: **100%** (461/461 tests passing)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler
- `npm run preview` - Preview production build

## 🚀 Features

- 🔐 **Authentication** - Secure user management
- 👥 **Member Directory** - Professional profiles
- 🏢 **Companies** - Company profiles and listings
- 📅 **Events** - Community events and meetups
- 👫 **Groups** - Interest-based communities
- 🛍️ **Marketplace** - Buy/sell products and services
- 📰 **News** - Tech news and updates
- 💼 **Opportunities** - Jobs and volunteering
- 📚 **Resources** - Educational content
- 🎯 **Onboarding** - Guided user setup

## 🤖 AI-Assisted Development

This project uses [Claude-Flow](https://github.com/ruvnet/claude-code-flow) for AI-assisted development. See [CLAUDE.md](./CLAUDE.md) for configuration and usage.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Nelson tech community for inspiration and feedback
- All contributors who have helped shape this platform
- Open source projects that made this possible

---

**Building connections, fostering growth, empowering the tech community.**