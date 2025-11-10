# Implementation Plan: Critical Security Fixes

**Project**: Nelson Tech Community Platform
**Plan Created**: November 10, 2025
**Target**: Phase 1 - Critical Security Fixes (P0)
**Estimated Duration**: 3-5 days
**Estimated Effort**: 22 hours

---

## Overview

This implementation plan addresses the **7 critical security issues** that block open source release. These are all P0 (Priority Zero) blockers that must be completed before any public deployment.

---

## Task Breakdown

### P0-1: Remove Development Authentication Bypass ⚠️ CRITICAL

**Issue**: Development bypass allows anyone to gain admin access
**Location**: `/src/shared/contexts/AuthContext.tsx:144-192`
**Risk Level**: CRITICAL
**Estimated Effort**: 2 hours

#### Implementation Steps:
1. Review the authentication bypass code (lines 144-192)
2. Identify all references to `VITE_DEV_BYPASS_AUTH`
3. Remove the entire bypass logic block
4. Remove environment variable from `.env.example`
5. Search codebase for any other bypass references
6. Test authentication flow still works
7. Verify no other dev bypass mechanisms exist

#### Acceptance Criteria:
- [ ] All `VITE_DEV_BYPASS_AUTH` code removed
- [ ] Environment variable removed from `.env.example`
- [ ] No grep matches for "DEV_BYPASS" or "bypass" in auth code
- [ ] Authentication still works in development
- [ ] No alternative bypass mechanisms exist

#### Files to Modify:
- `/src/shared/contexts/AuthContext.tsx`
- `.env.example`

#### Testing:
- [ ] Start dev server without bypass
- [ ] Verify login required
- [ ] Verify normal auth flow works
- [ ] Verify no admin access without credentials

---

### P0-2: Add DOMPurify Sanitization to Theme HTML Injection ⚠️ CRITICAL

**Issue**: Admin can inject raw HTML without sanitization (XSS)
**Location**: `/src/lib/themes/utils.ts:164-189`
**Risk Level**: CRITICAL
**Estimated Effort**: 4 hours

#### Implementation Steps:
1. Verify DOMPurify is already installed (it is: `^3.3.0`)
2. Import DOMPurify in `/src/lib/themes/utils.ts`
3. Locate the HTML injection points:
   - `custom_head_html`
   - `custom_body_html`
   - Any other innerHTML assignments
4. Wrap all innerHTML with `DOMPurify.sanitize()`
5. Configure DOMPurify for appropriate security level
6. Add JSDoc comments explaining sanitization
7. Search for other innerHTML usage in theme code
8. Add unit tests for sanitization

#### Acceptance Criteria:
- [ ] DOMPurify imported and configured
- [ ] All `custom_head_html` sanitized before insertion
- [ ] All `custom_body_html` sanitized before insertion
- [ ] Configuration allows safe HTML but blocks scripts
- [ ] Unit tests verify XSS attempts are blocked
- [ ] JSDoc comments document security measures

#### Code Example:
```typescript
import DOMPurify from 'dompurify';

// Configure DOMPurify
const sanitizeConfig = {
  ALLOWED_TAGS: ['style', 'link', 'meta'], // For head
  ALLOWED_ATTR: ['rel', 'href', 'type', 'content', 'name'],
  ALLOW_DATA_ATTR: false,
};

// Sanitize before injection
const sanitizedHTML = DOMPurify.sanitize(
  settings.custom_head_html || '',
  sanitizeConfig
);

element.innerHTML = sanitizedHTML;
```

#### Files to Modify:
- `/src/lib/themes/utils.ts`
- `/src/lib/themes/__tests__/utils.test.ts` (create if missing)

#### Testing:
- [ ] Test with safe HTML (should work)
- [ ] Test with `<script>` tags (should be stripped)
- [ ] Test with event handlers (should be stripped)
- [ ] Test with javascript: URLs (should be blocked)
- [ ] Test with data: URLs (should be blocked)

---

### P0-3: Fix Page Content Sanitization ⚠️ CRITICAL

**Issue**: Page builder content rendered without sanitization
**Location**: `/src/features/pages/components/PageDetail/index.tsx:187-192`
**Risk Level**: HIGH
**Estimated Effort**: 3 hours

#### Implementation Steps:
1. Review `jsonToHtml()` function implementation
2. Check if it already sanitizes output
3. Locate the rendering in PageDetail component (lines 187-192)
4. Import DOMPurify if not already present
5. Sanitize the output from `jsonToHtml()`
6. Check if BlockNote/TipTap editors already sanitize
7. Add sanitization at render point as defense-in-depth
8. Add unit tests

#### Acceptance Criteria:
- [ ] `jsonToHtml()` output is sanitized before rendering
- [ ] DOMPurify configured for rich content (allows more tags than theme HTML)
- [ ] BlockNote/TipTap output verified as safe
- [ ] Defense-in-depth: sanitization at multiple layers
- [ ] Unit tests verify XSS prevention
- [ ] No legitimate content is broken

#### Code Example:
```typescript
import DOMPurify from 'dompurify';

// Configure for rich content
const richContentConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table', 'tr', 'td', 'th',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
};

const sanitizedContent = DOMPurify.sanitize(
  jsonToHtml(page.content),
  richContentConfig
);

// Use dangerouslySetInnerHTML with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

#### Files to Modify:
- `/src/features/pages/components/PageDetail/index.tsx`
- `/src/lib/utils/jsonToHtml.ts` (or wherever it's defined)
- `/src/features/pages/__tests__/PageDetail.test.tsx`

#### Testing:
- [ ] Test with normal rich content (should work)
- [ ] Test with `<script>` in content (should be stripped)
- [ ] Test with event handlers (should be stripped)
- [ ] Test with iframes (should be blocked)
- [ ] Test with various block types from editor

---

### P0-4: Add Security Headers Configuration ⚠️ MEDIUM

**Issue**: Missing security headers (CSP, X-Frame-Options, HSTS)
**Locations**: `nginx.conf`, `netlify.toml`, Docker configs
**Risk Level**: MEDIUM
**Estimated Effort**: 3 hours

#### Implementation Steps:
1. Update `nginx.conf` with security headers
2. Update `netlify.toml` with security headers
3. Document headers in deployment guides
4. Test headers are applied correctly
5. Configure CSP to allow necessary resources

#### Security Headers to Add:
```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# HSTS (only if using HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com; frame-ancestors 'self';" always;
```

#### Acceptance Criteria:
- [ ] All security headers configured in nginx.conf
- [ ] All security headers configured in netlify.toml
- [ ] CSP allows required resources (Supabase, OpenAI, etc.)
- [ ] CSP blocks inline scripts (with exceptions documented)
- [ ] Headers documented in deployment guides
- [ ] Headers tested with securityheaders.com

#### Files to Modify:
- `/nginx.conf`
- `/netlify.toml`
- `/docs/deployment/SECURITY_HEADERS.md` (create)
- `/docs/deployment/README.md` (update)

#### Testing:
- [ ] Deploy to test environment
- [ ] Check headers with browser DevTools
- [ ] Test with https://securityheaders.com
- [ ] Verify app still functions with CSP
- [ ] Test external resources load correctly

---

### P0-5: Remove Debug Console.log Statements ⚠️ LOW

**Issue**: 11 files contain debug console.log statements
**Risk Level**: LOW (information disclosure)
**Estimated Effort**: 2 hours

#### Implementation Steps:
1. Search for all console.log statements in src/
2. Identify legitimate vs debug logs
3. Remove all debug logs (e.g., "Mock:", "Debug:", etc.)
4. Keep only console.error and console.warn where appropriate
5. Consider creating a logger utility
6. Update ESLint rules to enforce

#### Files with Console Logs:
- `/src/hooks/useOpportunityQueries.ts` - 13 console logs
- `/src/hooks/useImageProcessing.ts` - 3 console statements
- `/src/hooks/useMemberContributions.ts` - 2 console.error calls
- `/src/hooks/usePermissions.ts` - 1 commented console.log
- 7 more files to identify

#### Acceptance Criteria:
- [ ] No `console.log` statements in production code
- [ ] Only `console.error` and `console.warn` where justified
- [ ] Each remaining console statement has a comment explaining why
- [ ] Consider logger utility for structured logging
- [ ] ESLint rule enforced: `no-console: ['error', { allow: ['warn', 'error'] }]`

#### Files to Modify:
- All files with console statements (search results)
- `/eslint.config.js` (update rules)

#### Testing:
- [ ] Run ESLint and verify no violations
- [ ] Search codebase for `console.` - should only find error/warn
- [ ] Verify no debug information in browser console

---

### P0-6: Consolidate Duplicate Supabase Type Files ⚠️ LOW

**Issue**: 3 duplicate type files (12,000+ lines total)
**Risk Level**: LOW (technical debt, not security)
**Estimated Effort**: 3 hours

#### Implementation Steps:
1. Identify which file is the canonical source
2. Update all imports to use single source
3. Delete duplicate files
4. Add to .eslintignore if auto-generated
5. Update documentation
6. Verify TypeScript compilation works

#### Files:
- `/src/types/supabase.ts` - 4673 lines
- `/src/shared/types/database.types.ts` - 4183 lines
- `/src/shared/types/supabase.ts` - 4180 lines

#### Decision: Keep `/src/types/supabase.ts` as canonical

#### Acceptance Criteria:
- [ ] Single source of truth: `/src/types/supabase.ts`
- [ ] All imports updated to reference single file
- [ ] Duplicate files deleted
- [ ] File added to `.eslintignore` if auto-generated
- [ ] TypeScript compilation successful
- [ ] No broken imports
- [ ] Documentation updated

#### Files to Modify:
- Delete: `/src/shared/types/database.types.ts`
- Delete: `/src/shared/types/supabase.ts`
- Update: All files importing from deleted files
- Update: `.eslintignore` (add generated types)
- Update: `docs/architecture/PROJECT_STRUCTURE.md`

#### Testing:
- [ ] Run `npm run typecheck` - should pass
- [ ] Run `npm run build` - should succeed
- [ ] Verify no TypeScript errors
- [ ] Search for imports from deleted files

---

### P0-7: Add Security Contact Emails ⚠️ LOW

**Issue**: Placeholder emails in governance docs
**Risk Level**: LOW (documentation)
**Estimated Effort**: 1 hour

#### Implementation Steps:
1. Decide on security contact email
2. Update SECURITY.md
3. Update CODE_OF_CONDUCT.md
4. Consider creating security@ alias
5. Document in team docs

#### Acceptance Criteria:
- [ ] Real email in SECURITY.md (not placeholder)
- [ ] Real email in CODE_OF_CONDUCT.md (not placeholder)
- [ ] Email is monitored and will receive reports
- [ ] Email documented in internal team docs
- [ ] Consider: GitHub Security Advisories enabled

#### Files to Modify:
- `/SECURITY.md` (lines with `[Contact email to be added]`)
- `/CODE_OF_CONDUCT.md` (lines with `[Contact email to be added]`)

#### Recommendation:
- Create `security@<domain>` email alias
- Or use project maintainer's email
- Or use GitHub Security Advisories

---

## Parallel Execution Plan

These tasks can be executed in parallel by different agents:

### Agent Group A: Security Code Fixes (Parallel)
- **Agent 1**: P0-1 - Remove auth bypass
- **Agent 2**: P0-2 - Add DOMPurify to themes
- **Agent 3**: P0-3 - Fix page content sanitization

### Agent Group B: Configuration & Cleanup (Parallel)
- **Agent 4**: P0-4 - Add security headers
- **Agent 5**: P0-5 - Remove console.log statements
- **Agent 6**: P0-6 - Consolidate type files

### Agent Group C: Documentation (Sequential after A & B)
- **Agent 7**: P0-7 - Add contact emails
- **Agent 7**: Verify all fixes and run audit

---

## Verification Steps (After All Fixes)

### Security Audit Checklist:
- [ ] Run `npm audit` - fix any high/critical vulnerabilities
- [ ] Run security scanner (e.g., `npm run security:scan`)
- [ ] Test authentication without bypass
- [ ] Test XSS prevention in theme settings
- [ ] Test XSS prevention in page content
- [ ] Verify security headers with browser tools
- [ ] Verify no console.log in production build
- [ ] Verify TypeScript compilation
- [ ] Run full test suite: `npm run test`
- [ ] Run build: `npm run build`
- [ ] Manual penetration testing

### Code Review Checklist:
- [ ] All P0 tasks completed
- [ ] No regressions introduced
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commit messages clear and descriptive

---

## Success Criteria

### Phase 1 Complete When:
- ✅ All 7 P0 tasks completed
- ✅ All tests passing
- ✅ Build succeeds without errors
- ✅ No critical security vulnerabilities remain
- ✅ Security audit checklist complete
- ✅ Code committed and pushed
- ✅ Pull request created for review

---

## Risk Management

### Potential Blockers:
1. **DOMPurify configuration too strict** - May break legitimate content
   - Mitigation: Start permissive, tighten incrementally
   - Mitigation: Test with real content samples

2. **CSP blocks required resources** - May break functionality
   - Mitigation: Test thoroughly in dev environment
   - Mitigation: Use report-only mode first

3. **Type consolidation breaks imports** - TypeScript errors
   - Mitigation: Use IDE refactoring tools
   - Mitigation: Run typecheck frequently

4. **Auth removal breaks development** - Can't test locally
   - Mitigation: Ensure normal auth works in dev
   - Mitigation: Use test accounts

### Rollback Plan:
- All changes on feature branch
- Can revert commits individually
- Each task is independent (mostly)
- PR review before merging to main

---

## Timeline

### Day 1 (Monday)
- **Morning**: Agents 1-3 (Security code fixes) - 9 hours
- **Afternoon**: Review and test security fixes

### Day 2 (Tuesday)
- **Morning**: Agents 4-6 (Config & cleanup) - 8 hours
- **Afternoon**: Agent 7 (Documentation) - 1 hour

### Day 3 (Wednesday)
- **Morning**: Verification and testing - 4 hours
- **Afternoon**: Security audit and fixes - 4 hours

### Day 4 (Thursday)
- **Morning**: Final review and polish - 2 hours
- **Afternoon**: Create PR and documentation - 2 hours

### Day 5 (Friday)
- **Buffer day**: Address any issues found
- **Code review**: Team review of PR
- **Merge**: If approved

---

## Next Steps After Phase 1

Once Phase 1 (Critical Security) is complete:

1. **Phase 2**: Code Quality (Week 2)
   - Split large files
   - Type safety improvements
   - Add error boundaries

2. **Phase 3**: Testing (Week 2-3)
   - Add tests for critical paths
   - Achieve 30% coverage minimum

3. **Phase 4**: Documentation (Week 3)
   - Consolidate redundant docs
   - Create getting started guide

4. **Phase 5**: Final Review (Week 4)
   - Security penetration testing
   - Final code review
   - Release preparation

---

## Notes

- All work on branch: `claude/prepare-open-source-release-011CUzfePK4YoXMsFLh3w4aG`
- Each agent will create sub-tasks and track progress
- All changes will be committed incrementally
- Final PR will be created after all verification complete

---

**Plan Status**: ✅ Ready for Execution
**Approval Needed**: Yes (confirm before starting)
**Next Action**: Spawn parallel agents to execute tasks

---

**Created**: November 10, 2025
**Last Updated**: November 10, 2025
**Version**: 1.0
