# Contributing to Nelson Tech Community Platform

Thank you for your interest in contributing to the Nelson Tech Community Platform! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Questions](#questions)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/nelson-tech.git
   cd nelson-tech
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/iaminawe/nelson-tech.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (or Supabase account)
- Git

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials and other configuration.

3. **Set up the database**:
   ```bash
   # Follow instructions in database/README.md
   psql -U postgres -f database/setup_database.sql
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5555`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Check code style
- `npm run typecheck` - Run TypeScript type checking

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

- 🐛 **Bug fixes** - Find and fix bugs
- ✨ **New features** - Implement new functionality
- 📝 **Documentation** - Improve or add documentation
- 🎨 **UI/UX improvements** - Enhance user interface
- ♿ **Accessibility** - Improve accessibility features
- 🧪 **Tests** - Add or improve test coverage
- 🔧 **Refactoring** - Code quality improvements
- 🌐 **Translations** - Add internationalization support

### Finding Issues to Work On

- Check our [issue tracker](https://github.com/iaminawe/nelson-tech/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on an issue to let others know you're working on it

### Before You Start

- **Check existing issues** to avoid duplicate work
- **Discuss major changes** by opening an issue first
- **Keep changes focused** - one feature/fix per pull request
- **Follow our coding standards** (see below)

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**:
   - Write clear, concise code
   - Add tests for new functionality
   - Update documentation as needed
   - Follow our code style guidelines

3. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   See [Commit Message Guidelines](#commit-message-guidelines) below.

5. **Keep your branch up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template completely
   - Link any related issues

### Pull Request Requirements

Your PR must:

- ✅ Pass all automated checks (lint, tests, type checking)
- ✅ Include tests for new functionality
- ✅ Update relevant documentation
- ✅ Follow code style guidelines
- ✅ Have a clear, descriptive title
- ✅ Include a detailed description of changes
- ✅ Reference related issues (e.g., "Fixes #123")
- ✅ Be reviewed and approved by at least one maintainer

## Code Style Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Avoid `any` types** - use proper typing
- **Use interfaces** for object shapes
- **Enable strict mode** compliance

### React Components

- **Use functional components** with hooks
- **Keep components small** (< 300 lines)
- **Use meaningful names** (PascalCase for components)
- **Extract complex logic** into custom hooks
- **Use TypeScript interfaces** for props

### File Organization

- **Feature-based structure** - organize by feature, not by type
- **Colocate related files** - keep components, hooks, and tests together
- **Use index files** sparingly - prefer explicit imports
- **Max file size: 500 lines** - split larger files

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINT`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `AuthResponse`)

### Code Quality

- **Remove console.log statements** before committing
- **Handle errors properly** - don't silence failures
- **Add comments** for complex logic
- **Use early returns** to reduce nesting
- **Avoid magic numbers** - use named constants

## Testing Requirements

### Test Coverage

- **Aim for 80%+ coverage** for new code
- **Required tests**:
  - Unit tests for utility functions
  - Component tests for UI components
  - Integration tests for features
  - E2E tests for critical user flows

### Writing Tests

```typescript
// Example component test
describe('UserProfile', () => {
  it('should display user information', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('should handle edit action', async () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });
});
```

### Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Generate coverage report
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Users can now request password reset links via email.

Closes #123
```

```
fix(gallery): resolve image upload error on mobile

Fix MIME type validation that was causing uploads to fail
on iOS devices. Now properly handles HEIC format.

Fixes #456
```

### Best Practices

- **Use imperative mood** ("add" not "added" or "adds")
- **First line < 72 characters**
- **Provide context** in the body
- **Reference issues** in the footer

## Reporting Bugs

### Before Submitting

1. **Check existing issues** to avoid duplicates
2. **Update to latest version** and test again
3. **Collect information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## Suggesting Enhancements

### Enhancement Proposal Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Screenshots, mockups, or examples.
```

## Questions

- **General questions**: Open a [GitHub Discussion](https://github.com/iaminawe/nelson-tech/discussions)
- **Bug reports**: Open a [GitHub Issue](https://github.com/iaminawe/nelson-tech/issues)
- **Security concerns**: See [SECURITY.md](SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Recognition

Contributors will be recognized in our README and release notes. Thank you for making this project better! 🎉

---

**Happy Contributing!** 💻✨
