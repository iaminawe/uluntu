# GitHub Wiki Management

Guide for managing the Nelson Tech Community Platform GitHub Wiki.

## Overview

The GitHub Wiki is a separate git repository that provides quick, accessible documentation for the project. It complements the main MkDocs documentation site.

**Wiki URL**: https://github.com/iaminawe/nelson-tech/wiki

## Current Wiki Pages

✅ **Published**:
- **Home** - Main landing page with navigation
- **Getting Started** - Development setup guide
- **Hybrid State Management** - Architecture guide

📋 **Planned**:
- Deployment Guide
- Features Overview
- Contributing Guide
- Code of Conduct
- Development Guide
- Hybrid Pattern Guide
- And more...

## Wiki vs MkDocs Documentation

### GitHub Wiki
- **Purpose**: Quick reference, getting started guides
- **Audience**: New contributors, quick lookups
- **Format**: Simple markdown (flat structure)
- **URL**: https://github.com/iaminawe/nelson-tech/wiki

### MkDocs Site
- **Purpose**: Comprehensive documentation with search
- **Audience**: Developers needing detailed guides
- **Format**: Organized hierarchical structure
- **URL**: https://iaminawe.github.io/nelson-tech/

Both are valuable and serve different purposes!

## Managing the Wiki

### Quick Sync Script

Use the provided script to manage the wiki:

```bash
# Sync and check wiki status
./scripts/sync-wiki.sh
```

### Manual Management

The wiki is a separate git repository. To edit:

```bash
# Clone wiki repository
git clone https://github.com/iaminawe/nelson-tech.wiki.git /tmp/nelson-tech.wiki

# Make changes
cd /tmp/nelson-tech.wiki
# Edit markdown files...

# Commit and push
git add .
git commit -m "Update wiki documentation"
git push origin master
```

### Adding New Pages

1. **Create markdown file** in wiki directory:
   ```bash
   cd /tmp/nelson-tech.wiki
   touch New-Page-Title.md
   ```

2. **Write content** using markdown

3. **Link from Home.md** to make it discoverable:
   ```markdown
   - **[New Page Title](New-Page-Title)** - Description
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add new page: New Page Title"
   git push origin master
   ```

## Wiki File Naming

GitHub Wiki uses **flat structure** (no subdirectories):

### Good Names ✅
- `Home.md` - Main page
- `Getting-Started.md` - Gets URL: /Getting-Started
- `Feature-Gallery-System.md` - Organized by prefix
- `Deployment-Docker.md` - Clear categorization
- `API-Reference.md` - Simple and clear

### Avoid ❌
- `page 1.md` - No spaces (use hyphens)
- `test.md` - Not descriptive
- Subdirectories don't work in wikis

## Wiki Linking

### Internal Links
```markdown
[Link Text](Page-Name)
```

Example:
```markdown
See [Getting Started](Getting-Started) for setup instructions.
```

### External Links
```markdown
[Link Text](https://example.com)
```

### Links to Main Repo
```markdown
[CLAUDE.md](https://github.com/iaminawe/nelson-tech/blob/main/CLAUDE.md)
```

## Content Strategy

### What Goes in the Wiki

✅ **Good for Wiki**:
- Quick start guides
- Common troubleshooting
- Contribution guidelines
- Architecture overviews
- Development setup
- FAQ sections

❌ **Better for MkDocs**:
- Detailed API references
- Long-form tutorials
- Complex nested documentation
- Generated documentation
- Searchable reference material

## Maintenance

### Keep Wiki Updated

When making significant changes to the project:

1. **Update wiki pages** that reference changed features
2. **Add new pages** for major new features
3. **Archive outdated** information
4. **Test all links** regularly

### Regular Review

Schedule quarterly reviews:
- [ ] Check all links work
- [ ] Update outdated information
- [ ] Add new features to overview
- [ ] Verify setup instructions
- [ ] Update screenshots if UI changed

## Automation Ideas

### Future Enhancements

Consider automating:
- **Auto-sync from docs** - Script to convert select docs/ files to wiki
- **Link checking** - Automated broken link detection
- **Version badges** - Show which version docs apply to
- **Last updated** - Auto-add update timestamps

## Best Practices

### Writing Wiki Content

1. **Keep it concise** - Wiki readers want quick answers
2. **Use clear headings** - Help scanners find information
3. **Link generously** - Connect related pages
4. **Update dates** - Show when content was last verified
5. **Test instructions** - Verify commands work

### Navigation Structure

- **Home page** is the entry point - make it navigable
- **Group related pages** with naming prefixes
- **Provide breadcrumbs** with links back to Home
- **Cross-link** related pages

### Markdown Tips

```markdown
# Use H1 for page title (only one per page)
## H2 for main sections
### H3 for subsections

- Bullet lists for quick scanning
1. Numbered lists for steps

**Bold** for emphasis
`code` for commands and code
> Blockquotes for important notes

[Links](Page-Name) to other pages
```

## GitHub Wiki Features

### Advantages
- ✅ Built into GitHub
- ✅ Easy editing via web interface
- ✅ Git version control
- ✅ Markdown support
- ✅ No build process needed
- ✅ Free and simple

### Limitations
- ❌ No subdirectories
- ❌ Basic search only
- ❌ No advanced features (tabs, admonitions)
- ❌ Limited theming
- ❌ Separate from main repo

## Troubleshooting

### Wiki Not Showing Changes

```bash
# Clear browser cache
# Wait 30 seconds for GitHub to update
# Check commit went through:
cd /tmp/nelson-tech.wiki
git log -1
```

### Can't Clone Wiki

```bash
# Ensure wiki is enabled in GitHub repo settings
# Check you have access to the repository
# Use HTTPS URL: https://github.com/iaminawe/nelson-tech.wiki.git
```

### Lost Local Wiki

```bash
# Just re-clone it
rm -rf /tmp/nelson-tech.wiki
git clone https://github.com/iaminawe/nelson-tech.wiki.git /tmp/nelson-tech.wiki
```

## Resources

- **GitHub Wiki Docs**: https://docs.github.com/en/communities/documenting-your-project-with-wikis
- **Markdown Guide**: https://www.markdownguide.org/
- **Our Wiki**: https://github.com/iaminawe/nelson-tech/wiki
- **Our Docs Site**: https://iaminawe.github.io/nelson-tech/

---

**Last Updated**: November 11, 2025
