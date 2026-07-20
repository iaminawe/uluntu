# Development Tips & Tricks

Helpful tips and best practices for developing on the Nelson Tech Community Platform.

---

## Quick Tips

### Fast Development Workflow

```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Type checking (watch mode)
npm run typecheck -- --watch

# Terminal 3: Tests (watch mode)
npm test -- --watch
```

### Useful Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias nt="cd ~/projects/nelson-tech"
alias ntdev="npm run dev"
alias nttest="npm test"
alias ntbuild="npm run build"
alias ntcheck="npm run typecheck && npm run lint && npm test"
```

---

## VS Code Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "styled-components.vscode-styled-components",
    "ms-playwright.playwright",
    "orta.vscode-jest"
  ]
}
```

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Snippets

Create `.vscode/snippets.code-snippets`:

```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export const ${1:Component}: React.FC<${1:Component}Props> = ({ $3 }) => {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "};"
    ]
  },
  "React Query Hook": {
    "prefix": "usequery",
    "body": [
      "export const use${1:Feature} = () => {",
      "  return useQuery({",
      "    queryKey: ['${2:key}'],",
      "    queryFn: async () => {",
      "      $0",
      "    },",
      "  });",
      "};"
    ]
  }
}
```

---

## Performance Tips

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run preview

# Or use bundle analyzer
npm install --save-dev rollup-plugin-visualizer
```

Add to `vite.config.ts`:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    }),
  ],
});
```

### Lazy Loading

Always lazy load routes:

```typescript
// ✅ Good
const AdminPage = lazy(() => import('./pages/AdminPage'));

// ❌ Bad
import AdminPage from './pages/AdminPage';
```

### Memoization

Use React.memo for expensive components:

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});
```

Use useMemo for expensive calculations:

```typescript
const filteredData = useMemo(() => {
  return data.filter(item => expensiveFilter(item));
}, [data]);
```

---

## Debugging Tips

### React Query DevTools

Enable in development:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Redux DevTools

Already configured! Just install the browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### Debug Supabase Queries

```typescript
// Enable query logging
const supabase = createClient(url, key, {
  auth: {
    debug: true,
  },
});

// Log specific query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .then(result => {
    console.log('Query result:', result);
    return result;
  });
```

### Network Debugging

Use browser DevTools:
1. Open DevTools (F12)
2. Network tab
3. Filter: XHR/Fetch
4. Check failed requests
5. Inspect headers and response

---

## Testing Tips

### Test Component in Isolation

```typescript
import { renderWithProviders } from '@/test-utils';

test('component works', () => {
  renderWithProviders(<MyComponent />);
  // Test component behavior
});
```

### Mock Supabase

```typescript
// __mocks__/supabase.ts
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      data: mockData,
      error: null,
    })),
  })),
};
```

### Snapshot Testing

```typescript
test('matches snapshot', () => {
  const { container } = render(<MyComponent />);
  expect(container).toMatchSnapshot();
});

// Update snapshots when UI changes:
// npm test -- --updateSnapshot
```

### E2E Testing Tips

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:5555');
  await page.click('text=Sign In');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('[type=submit]');
  await expect(page).toHaveURL(/dashboard/);
});
```

---

## Database Tips

### Reset Database

```bash
# Full reset (⚠️ DELETES ALL DATA)
supabase db reset

# Apply specific migration
supabase migration up
```

### Create Migration

```bash
# Create new migration file
supabase migration new my_feature

# Edit the file in supabase/migrations/
# Then apply
supabase db push
```

### Quick SQL Snippets

```sql
-- Find duplicate emails
SELECT email, COUNT(*)
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'my_table';

-- View active connections
SELECT * FROM pg_stat_activity;
```

---

## Git Tips

### Useful Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --graph --oneline --all
```

### Keep Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

### Interactive Rebase

Clean up commits before PR:

```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# In editor, mark commits to squash/reword
# Save and close
```

---

## TypeScript Tips

### Type Inference

Let TypeScript infer when possible:

```typescript
// ✅ Good - inferred
const user = await fetchUser();

// ❌ Unnecessary
const user: User = await fetchUser();
```

### Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}

// Usage
if (isUser(data)) {
  // TypeScript knows data is User
  console.log(data.email);
}
```

### Utility Types

```typescript
// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'avatar'>;

// Omit specific properties
type UserWithoutPassword = Omit<User, 'password'>;
```

---

## Tailwind Tips

### Custom Classes

```typescript
// Use cn() helper for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)} />
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  text-sm          // Mobile
  md:text-base     // Tablet
  lg:text-lg       // Desktop
">
```

### Dark Mode

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
">
```

---

## Supabase Tips

### Environment-Specific Keys

```env
# Development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-key

# Production (separate .env.production)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key
```

### Storage Best Practices

```typescript
// Upload with progress
const { data, error } = await supabase.storage
  .from('bucket')
  .upload('path/file.jpg', file, {
    onUploadProgress: (progress) => {
      console.log(`${progress.loaded}/${progress.total}`);
    },
  });

// Generate signed URL
const { data } = await supabase.storage
  .from('bucket')
  .createSignedUrl('path/file.jpg', 3600); // 1 hour
```

### Real-time Subscriptions

```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Clean up
return () => {
  subscription.unsubscribe();
};
```

---

## Performance Monitoring

### Lighthouse

```bash
# Build production
npm run build

# Serve locally
npm run preview

# Run Lighthouse (in Chrome DevTools)
# Or use CLI:
npx lighthouse http://localhost:4173
```

### React Profiler

```typescript
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  console.log(`${id} took ${actualDuration}ms to render`);
}
```

---

## Keyboard Shortcuts

### VS Code
- `Cmd/Ctrl + P` - Quick file open
- `Cmd/Ctrl + Shift + P` - Command palette
- `Cmd/Ctrl + B` - Toggle sidebar
- `Cmd/Ctrl + `` ` - Toggle terminal
- `Cmd/Ctrl + /` - Toggle comment
- `Alt + Up/Down` - Move line up/down
- `Cmd/Ctrl + D` - Select next occurrence

### Browser DevTools
- `F12` - Open DevTools
- `Cmd/Ctrl + Shift + C` - Inspect element
- `Cmd/Ctrl + Shift + M` - Toggle device toolbar
- `Cmd/Ctrl + Shift + J` - Console
- `Cmd/Ctrl + R` - Reload
- `Cmd/Ctrl + Shift + R` - Hard reload

---

## Useful npm Scripts

### Custom Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev:debug": "NODE_OPTIONS='--inspect' vite",
    "test:ui": "npm test -- --ui",
    "test:coverage": "npm test -- --coverage",
    "clean": "rm -rf node_modules dist .vite",
    "fresh": "npm run clean && npm install",
    "check": "npm run typecheck && npm run lint && npm test"
  }
}
```

---

## Resources

- **[FAQ](FAQ)** - Common questions
- **[Troubleshooting](Troubleshooting)** - Problem solving
- **[Full Documentation](https://iaminawe.github.io/nelson-tech/)** - Technical docs
- **[Community Guide](Community-Guide)** - Contributing

---

**Previous**: [Community Guide](Community-Guide) | **Next**: [Deployment Checklist](Deployment-Checklist)
