# Wiki Setup Instructions

How to populate the GitHub wiki with the prepared content.

---

## Overview

This folder contains pre-written wiki content ready to be added to the GitHub wiki. All pages are written in Markdown and optimized for GitHub's wiki system.

## Wiki Pages Included

1. **Home.md** - Wiki landing page
2. **Quick-Start.md** - Quick setup guide
3. **FAQ.md** - Frequently asked questions
4. **Troubleshooting.md** - Common issues and solutions
5. **Community-Guide.md** - Contribution guidelines
6. **Development-Tips.md** - Development best practices
7. **Deployment-Checklist.md** - Production deployment checklist
8. **_Sidebar.md** - Wiki navigation sidebar

---

## Method 1: Manual Upload (Easiest)

### Step 1: Access the Wiki

1. Go to: `https://github.com/iaminawe/nelson-tech/wiki`
2. Click **"Create the first page"** or **"New Page"**

### Step 2: Create Each Page

For each `.md` file in this folder:

1. Click **"New Page"** in the wiki
2. Enter the page title (e.g., "Quick Start" for `Quick-Start.md`)
3. Copy the content from the `.md` file
4. Paste into the wiki editor
5. Click **"Save Page"**

**Page Titles (must match exactly for links to work)**:
- `Home` (this will be created automatically)
- `Quick Start`
- `FAQ`
- `Troubleshooting`
- `Community Guide`
- `Development Tips`
- `Deployment Checklist`

### Step 3: Add Sidebar

1. Click **"Add custom sidebar"** in the wiki
2. Copy content from `_Sidebar.md`
3. Paste and save

---

## Method 2: Git Clone (Advanced)

GitHub wikis are git repositories. You can clone and push content.

### Step 1: Clone the Wiki Repository

```bash
# Clone the wiki (separate from main repo)
git clone https://github.com/iaminawe/nelson-tech.wiki.git
cd nelson-tech.wiki
```

### Step 2: Copy Content

```bash
# From the main repo, copy wiki content
cp ../wiki-content/*.md .
```

### Step 3: Commit and Push

```bash
# Add all pages
git add .

# Commit
git commit -m "Initial wiki setup with comprehensive documentation"

# Push to wiki
git push origin master
```

### Step 4: Verify

Visit `https://github.com/iaminawe/nelson-tech/wiki` to see your pages.

---

## Method 3: Script (Automated)

### Create Upload Script

Create `upload-wiki.sh`:

```bash
#!/bin/bash

# Clone wiki
git clone https://github.com/iaminawe/nelson-tech.wiki.git
cd nelson-tech.wiki

# Copy content
cp ../wiki-content/*.md .

# Remove instruction file
rm WIKI_SETUP_INSTRUCTIONS.md

# Commit and push
git add .
git commit -m "docs: add comprehensive wiki documentation

- Home page with quick links
- Quick start guide
- FAQ with common questions
- Troubleshooting guide
- Community contribution guide
- Development tips and tricks
- Deployment checklist
- Navigation sidebar"

git push origin master

# Clean up
cd ..
rm -rf nelson-tech.wiki

echo "✅ Wiki updated successfully!"
echo "View at: https://github.com/iaminawe/nelson-tech/wiki"
```

Run it:

```bash
chmod +x upload-wiki.sh
./upload-wiki.sh
```

---

## Page Structure

### Home Page

The landing page with:
- Quick links to all wiki pages
- Links to MkDocs documentation site
- Feature highlights
- Getting started guide

### Navigation Flow

Recommended reading order for new users:
1. **Home** - Overview
2. **Quick Start** - Get up and running
3. **Development Tips** - Best practices
4. **FAQ** - Common questions
5. **Troubleshooting** - Problem solving

For contributors:
1. **Community Guide** - How to contribute
2. **Development Tips** - Coding practices
3. **Deployment Checklist** - Production deployment

### Sidebar Navigation

The `_Sidebar.md` provides:
- Quick navigation to all pages
- Links to full documentation site
- Links to GitHub issues and discussions
- Links to specific documentation sections

---

## Customization

### Update Links

If your repo structure changes, update these:

- Links to `../` files (like `../README.md`, `../CLAUDE.md`)
- Links to MkDocs site (currently `https://iaminawe.github.io/nelson-tech/`)
- GitHub repository URLs

### Add New Pages

To add a new wiki page:

1. Create the `.md` file in `wiki-content/`
2. Add link to `_Sidebar.md`
3. Add link to `Home.md` if it's a main page
4. Follow the naming convention: `Page-Title.md`
5. Upload to wiki

### Update Content

To update existing pages:

1. Edit the `.md` file in `wiki-content/`
2. Copy updated content to wiki
3. Or use git method to push changes

---

## Wiki vs. MkDocs Documentation

### Use Wiki For:
- Quick start guides
- FAQs
- Troubleshooting
- Community guides
- Living documents that change frequently
- Content that needs easy community editing

### Use MkDocs Site For:
- Comprehensive technical documentation
- API references
- Architecture documentation
- Feature documentation
- Code examples
- Versioned documentation

Both link to each other for complete coverage.

---

## Best Practices

### Naming Convention

- Use hyphens for multi-word pages: `Quick-Start.md`
- First letter of each word capitalized
- No spaces in file names
- Use `.md` extension

### Internal Links

```markdown
[Link Text](Page-Title)

Examples:
[Quick Start](Quick-Start)
[FAQ](FAQ)
[Troubleshooting](Troubleshooting)
```

### External Links

```markdown
[Link Text](https://full-url.com)

Example:
[Full Documentation](https://iaminawe.github.io/nelson-tech/)
```

### Links to Main Repo Files

```markdown
[File](../path/to/file.md)

Examples:
[CLAUDE.md](../CLAUDE.md)
[CONTRIBUTING.md](../CONTRIBUTING.md)
```

---

## Maintenance

### Keeping Wiki Updated

Wiki should be updated when:
- New features are added
- FAQs accumulate
- Troubleshooting procedures change
- Deployment process changes

### Review Schedule

- **Monthly**: Review FAQ and Troubleshooting
- **Quarterly**: Update Quick Start if setup changes
- **Per Release**: Update Deployment Checklist
- **As Needed**: Community Guide, Development Tips

---

## Troubleshooting

### Links Not Working

- Ensure page titles match exactly (case-sensitive)
- Use hyphens, not spaces
- Check for typos in page names

### Sidebar Not Showing

- File must be named exactly `_Sidebar.md`
- Must be in wiki root
- Check for syntax errors

### Images Not Loading

GitHub wiki supports images:
```markdown
![Alt text](https://url-to-image.png)
```

Or upload images directly in wiki editor.

### Formatting Issues

- Preview before saving
- Use GitHub Flavored Markdown
- Check for unclosed code blocks
- Verify list formatting

---

## Additional Resources

- [GitHub Wiki Documentation](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

---

## Questions?

If you have questions about the wiki setup:
- Open an issue on GitHub
- Start a discussion
- Contact maintainers

---

**Ready to set up the wiki? Choose your method above and get started!** 🚀
