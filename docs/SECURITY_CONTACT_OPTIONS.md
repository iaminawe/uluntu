# Security Contact Email Options

This document provides recommendations for the security contact email that should be added to SECURITY.md and CODE_OF_CONDUCT.md.

## Recommended Options

### Option 1: GitHub Security Advisories (Recommended)

**Use GitHub's built-in security advisory feature instead of an email:**

In SECURITY.md, replace the email section with:
```markdown
**Please use GitHub Security Advisories to report vulnerabilities:**

https://github.com/iaminawe/nelson-tech/security/advisories/new
```

**Pros:**
- ✅ Built-in to GitHub, no additional infrastructure needed
- ✅ Private communication channel
- ✅ Coordinated disclosure workflow
- ✅ CVE assignment support
- ✅ No email maintenance required
- ✅ Professional and standard practice

**Cons:**
- ❌ Requires GitHub account to report
- ❌ Less familiar to some reporters

### Option 2: Dedicated Security Email Alias

**Create a dedicated security email alias:**
- `security@yourdomain.com`
- `security@nelson-tech.com`
- `security@kootenay-tech-community.com`

**Pros:**
- ✅ Professional appearance
- ✅ Can be forwarded to multiple team members
- ✅ Familiar to security researchers
- ✅ Can use PGP encryption

**Cons:**
- ❌ Requires email infrastructure setup
- ❌ Needs monitoring and maintenance
- ❌ Potential for spam

### Option 3: Project Maintainer's Email

**Use the primary maintainer's email:**
- `your-email@domain.com`

**Pros:**
- ✅ Simple and immediate
- ✅ No additional setup required
- ✅ Direct communication

**Cons:**
- ❌ Single point of contact (vacation/absence issues)
- ❌ Less professional appearance
- ❌ Privacy concerns (personal email exposure)

### Option 4: GitHub Issues Email

**Use GitHub's private reporting via email:**
- Contact through GitHub profile (if enabled)

**Pros:**
- ✅ Uses existing GitHub infrastructure
- ✅ Can keep email private

**Cons:**
- ❌ Not standard for security reports
- ❌ Less discoverable

## Recommendation

**Use Option 1: GitHub Security Advisories**

This is the most professional, secure, and maintainable option. It's the standard practice for open source projects on GitHub.

## How to Enable GitHub Security Advisories

1. Go to: https://github.com/iaminawe/nelson-tech/settings/security_analysis
2. Enable "Private vulnerability reporting"
3. Update SECURITY.md to reference the advisories URL

## Current Placeholder Locations

The following files need to be updated:

1. `/SECURITY.md` - Line 13
2. `/CODE_OF_CONDUCT.md` - Line 55

## Suggested Updates

### For SECURITY.md (Line 13):

**Current:**
```markdown
**[Security contact email to be added]**
```

**Option 1 (Recommended):**
```markdown
**Please use GitHub Security Advisories:**

https://github.com/iaminawe/nelson-tech/security/advisories/new

Alternatively, you can email: security@[your-domain].com
```

**Option 2 (Email only):**
```markdown
**security@nelson-tech.com**
```

### For CODE_OF_CONDUCT.md (Line 55):

**Current:**
```markdown
**[Contact email to be added]**
```

**Suggested:**
```markdown
**conduct@nelson-tech.com** or create a private issue at https://github.com/iaminawe/nelson-tech/issues/new
```

## Next Steps

1. Decide which option to use
2. If using dedicated email:
   - Set up email alias
   - Configure forwarding
   - Test receipt
3. If using GitHub Security Advisories:
   - Enable in repository settings
   - Test the flow
4. Update both files with chosen contact method
5. Commit changes

## Temporary Placeholder (For Now)

If you need to commit immediately without deciding, you can use:

```markdown
**Please report security issues via GitHub Issues (mark as confidential) or contact the repository owner through GitHub.**
```

This provides a functional interim solution while you set up the permanent contact method.

---

**Decision Required**: Which option would you like to use for the security contact?
