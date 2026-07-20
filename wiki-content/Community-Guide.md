# Community Contribution Guide

Welcome! We're excited that you want to contribute to the Nelson Tech Community Platform.

---

## Ways to Contribute

There are many ways to contribute, and all are valuable:

### 🐛 Report Bugs
Found a bug? Help us fix it!
- Search [existing issues](https://github.com/iaminawe/nelson-tech/issues)
- If it's new, [create an issue](https://github.com/iaminawe/nelson-tech/issues/new)
- Include steps to reproduce, expected vs actual behavior

### 💡 Suggest Features
Have an idea for improvement?
- Check [existing discussions](https://github.com/iaminawe/nelson-tech/discussions)
- Start a new discussion with your proposal
- Explain the use case and benefits

### 📝 Improve Documentation
Documentation can always be better!
- Fix typos or unclear explanations
- Add examples or tutorials
- Update outdated information
- Create helpful guides

### 🔧 Submit Code
Ready to write code?
- Pick an issue labeled `good first issue` or `help wanted`
- Fork the repository
- Create a feature branch
- Submit a pull request

### 💬 Help Others
Share your knowledge!
- Answer questions in Discussions
- Help troubleshoot issues
- Review pull requests
- Mentor new contributors

---

## Getting Started

### 1. Set Up Your Environment

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/nelson-tech.git
cd nelson-tech

# Add upstream remote
git remote add upstream https://github.com/iaminawe/nelson-tech.git

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

See [Quick Start](Quick-Start) for detailed setup.

### 2. Read the Guidelines

Essential reading:
- [CLAUDE.md](../CLAUDE.md) - Development patterns ⭐
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full contribution guide
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) - Community standards
- [Hybrid Pattern Guide](https://iaminawe.github.io/nelson-tech/guides/HYBRID_PATTERN_GUIDE/)

### 3. Pick an Issue

Good starting points:
- Issues labeled [`good first issue`](https://github.com/iaminawe/nelson-tech/labels/good%20first%20issue)
- Issues labeled [`help wanted`](https://github.com/iaminawe/nelson-tech/labels/help%20wanted)
- Documentation improvements
- Test additions

---

## Development Workflow

### Branch Strategy

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Or for bug fixes
git checkout -b fix/bug-description
```

Branch naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Making Changes

1. **Write Tests First** (TDD approach)
```bash
# Create test file
# src/features/my-feature/__tests__/MyFeature.test.tsx

npm test -- --watch
```

2. **Implement Feature**
Follow the established patterns:
- Feature-based structure (`/src/features/`)
- Hybrid state management (React Query + Redux)
- TypeScript with proper types
- Component composition

3. **Check Your Code**
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm test

# Build
npm run build
```

### Code Style

We use:
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **TypeScript** - Type safety

Configuration is already set up. Just run:
```bash
npm run lint
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
type(scope): description

# Examples
feat(groups): add group invitation system
fix(gallery): resolve batch upload memory leak
docs(readme): update installation instructions
test(auth): add login flow tests
refactor(api): simplify error handling
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `style` - Code style/formatting
- `chore` - Build/tooling

---

## Submitting Pull Requests

### Before Submitting

Checklist:
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Types are correct (`npm run typecheck`)
- [ ] Code is linted (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### Creating the PR

1. **Push your branch**:
```bash
git push origin feature/my-feature
```

2. **Open Pull Request** on GitHub

3. **Fill out the template**:
   - Describe your changes
   - Reference related issues
   - Add screenshots if UI changes
   - List breaking changes if any

4. **Request Review**:
   - PR will be auto-assigned to maintainers
   - Address review feedback
   - Make requested changes

### PR Review Process

What reviewers look for:
- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation
- ✅ Breaking changes
- ✅ Performance impact
- ✅ Security considerations

Typical timeline:
- Initial review: 1-3 days
- Follow-up: 1-2 days
- Merge: After approval + CI passes

---

## Development Guidelines

### Code Structure

Follow the feature-based structure:

```
src/features/my-feature/
├── api/                    # React Query hooks
│   └── useMyFeatureApi.ts
├── hooks/                  # Hybrid hooks
│   └── useMyFeature.ts
├── store/                  # Redux slices
│   └── myFeatureSlice.ts
├── components/             # React components
│   ├── MyFeatureList.tsx
│   └── MyFeatureItem.tsx
├── types/                  # TypeScript types
│   └── index.ts
└── __tests__/             # Tests
    └── MyFeature.test.tsx
```

### State Management

Use the hybrid pattern:

**Server State** (React Query):
```typescript
// api/useMyFeatureApi.ts
export const useMyFeatures = () => {
  return useQuery({
    queryKey: ['myFeatures'],
    queryFn: fetchMyFeatures,
  });
};
```

**UI State** (Redux):
```typescript
// store/myFeatureSlice.ts
const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState: { filter: 'all', selectedId: null },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});
```

**Hybrid Hook** (Integration):
```typescript
// hooks/useMyFeature.ts
export const useMyFeature = () => {
  const { data } = useMyFeatureApi();
  const dispatch = useDispatch();
  const filter = useSelector(selectFilter);

  return {
    items: data?.filter(item => matchesFilter(item, filter)),
    setFilter: (filter) => dispatch(setFilter(filter)),
  };
};
```

### Testing

Write tests for:
- Components (unit tests)
- Hooks (integration tests)
- API functions (mocked)
- User flows (E2E)

Example:
```typescript
// __tests__/MyFeature.test.tsx
describe('MyFeature', () => {
  it('renders correctly', () => {
    render(<MyFeature />);
    expect(screen.getByText('My Feature')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<MyFeature />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

### Documentation

Document your code:

1. **JSDoc comments** for complex functions:
```typescript
/**
 * Processes user data and returns formatted result
 * @param userId - The user's unique identifier
 * @param options - Processing options
 * @returns Formatted user data
 */
export const processUser = (userId: string, options?: Options) => {
  // ...
};
```

2. **README files** for new features:
```markdown
# My Feature

## Overview
Brief description...

## Usage
How to use...

## API
Function references...
```

3. **Update main docs** if needed:
- Add to MkDocs navigation
- Update feature list
- Add usage examples

---

## Community Standards

### Code of Conduct

We follow our [Code of Conduct](../CODE_OF_CONDUCT.md). Key points:

- **Be respectful** - Treat everyone with respect
- **Be welcoming** - Welcome newcomers
- **Be constructive** - Provide helpful feedback
- **Be patient** - People have different experience levels

### Communication

Best practices:
- **Be clear** - Explain your ideas clearly
- **Be concise** - Respect people's time
- **Be kind** - Assume good intentions
- **Be responsive** - Reply to questions and feedback

### Getting Help

If you're stuck:
1. Check [FAQ](FAQ) and [Troubleshooting](Troubleshooting)
2. Search [Discussions](https://github.com/iaminawe/nelson-tech/discussions)
3. Ask in GitHub Discussions
4. Tag maintainers if urgent

---

## Recognition

We appreciate all contributors!

- Contributors are listed in README
- Significant contributions are highlighted in release notes
- Active contributors may be invited as maintainers

---

## Resources

### Essential Reading
- [CLAUDE.md](../CLAUDE.md) - Development patterns
- [Hybrid Pattern Guide](https://iaminawe.github.io/nelson-tech/guides/HYBRID_PATTERN_GUIDE/)
- [Component Patterns](https://iaminawe.github.io/nelson-tech/components/common-patterns/)

### Quick References
- [Development Tips](Development-Tips)
- [FAQ](FAQ)
- [Troubleshooting](Troubleshooting)

### Full Documentation
- [MkDocs Site](https://iaminawe.github.io/nelson-tech/)
- [Architecture](https://iaminawe.github.io/nelson-tech/architecture/)
- [Features](https://iaminawe.github.io/nelson-tech/features/)

---

## Questions?

- **General questions**: [GitHub Discussions](https://github.com/iaminawe/nelson-tech/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/iaminawe/nelson-tech/issues)
- **Security issues**: See [SECURITY.md](../SECURITY.md)

---

**Thank you for contributing to Nelson Tech Community Platform!** 🎉

---

**Previous**: [Troubleshooting](Troubleshooting) | **Next**: [Development Tips](Development-Tips)
