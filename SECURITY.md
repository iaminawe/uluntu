# Security Policy

## Reporting Security Vulnerabilities

The Nelson Tech Community Platform team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities using one of these methods:

**Option 1: GitHub Security Advisories (Recommended)**

https://github.com/iaminawe/nelson-tech/security/advisories/new

**Option 2: Private Issue**

Create a private issue at https://github.com/iaminawe/nelson-tech/issues and mention it's a security concern

**Option 3: Contact Repository Owner**

Contact the repository owner directly through GitHub: https://github.com/iaminawe

### What to Include in Your Report

To help us better understand the nature and scope of the potential issue, please include as much of the following information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths of source files** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability** and potential for exploitation
- **Any special configuration** required to reproduce the issue

### What to Expect

After you submit a report, here's what will happen:

1. **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours.

2. **Assessment**: Our security team will investigate and assess the vulnerability, typically within 5 business days.

3. **Updates**: We'll keep you informed about our progress throughout the process.

4. **Resolution**: Once the vulnerability is confirmed, we'll work on a fix and coordinate the release with you.

5. **Credit**: We'll credit you for the discovery (unless you prefer to remain anonymous) when we publicly disclose the vulnerability.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

**Note**: As this project is in active development, we recommend always using the latest version.

## Security Best Practices for Contributors

### Environment Variables

- **Never commit sensitive data** (API keys, passwords, tokens) to the repository
- Use `.env` files (which are gitignored) for local development
- Use environment variable placeholders in `.env.example`
- Rotate credentials if accidentally committed (and remove from git history)

### Authentication & Authorization

- Use Supabase Row Level Security (RLS) policies for all database access
- Never rely solely on client-side permission checks
- Validate all user inputs on the server side
- Implement proper session management and timeout

### Data Protection

- Sanitize all user inputs to prevent XSS attacks
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest and in transit
- Implement proper CORS policies

### Dependencies

- Keep dependencies up to date (`npm audit`)
- Review dependency changes before updating
- Use `npm ci` in production for reproducible builds
- Remove unused dependencies

### Code Review

- All code changes require review before merging
- Security-sensitive changes require additional scrutiny
- Use automated security scanning tools
- Test security features thoroughly

## Known Security Considerations

### Critical Issues to Address Before Production

The following security issues have been identified and **must be addressed before public release**:

1. **Development Authentication Bypass** (CRITICAL)
   - Location: `/src/shared/contexts/AuthContext.tsx`
   - Issue: `VITE_DEV_BYPASS_AUTH` allows bypassing authentication
   - **Action Required**: Remove this feature entirely before production deployment

2. **Unsafe HTML Injection** (CRITICAL)
   - Location: `/src/lib/themes/utils.ts`
   - Issue: Admin-injectable HTML without sanitization
   - **Action Required**: Add DOMPurify sanitization to custom_head_html and custom_body_html

3. **Missing Content Sanitization** (HIGH)
   - Location: `/src/features/pages/components/PageDetail/index.tsx`
   - Issue: Page content rendered without explicit sanitization
   - **Action Required**: Ensure all user-generated content is sanitized

4. **Session Storage Security** (MEDIUM)
   - Issue: Session IDs stored in sessionStorage (vulnerable to XSS)
   - **Action Required**: Use secure, httpOnly cookies for session management

5. **Missing Security Headers** (MEDIUM)
   - Issue: No Content-Security-Policy, X-Frame-Options, or HSTS headers
   - **Action Required**: Configure security headers in nginx/deployment

### Areas Under Active Security Review

- File upload validation and storage
- Rate limiting implementation
- API endpoint authentication
- Error message information disclosure
- CSRF protection implementation

## Disclosure Policy

When we receive a security bug report, we will:

1. **Confirm the problem** and determine affected versions
2. **Audit the code** to find similar problems
3. **Prepare fixes** for all supported versions
4. **Release new versions** with the fixes
5. **Prominently announce** the issue (after patches are available)

We ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Make a good faith effort to avoid:
  - Privacy violations
  - Destruction of data
  - Interruption or degradation of our service
- Do not exploit the vulnerability beyond what's necessary to demonstrate it

## Security Updates

Security updates will be released as patch versions and announced through:

- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Project README.md

Subscribe to repository releases to be notified of security updates.

## Third-Party Security

This project uses several third-party services and libraries:

- **Supabase**: Handles authentication, database, and storage
- **Resend**: Email delivery service
- **OpenAI/Anthropic APIs**: AI-powered features

Please also review the security policies of these services:

- [Supabase Security](https://supabase.com/security)
- [Resend Security](https://resend.com/security)
- [OpenAI Security](https://openai.com/security)

## Security Audits

We periodically conduct security audits and penetration testing. If you're interested in conducting a professional security audit, please contact us at the security email address above.

## Compliance

This project aims to comply with:

- OWASP Top 10 security recommendations
- General Data Protection Regulation (GDPR) principles
- Security best practices for web applications

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-strategies)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

## Questions

If you have questions about this security policy, please open a discussion in GitHub Discussions or contact the maintainers.

---

**Thank you for helping keep Nelson Tech Community Platform secure!** 🔒

**Last Updated**: November 10, 2025
