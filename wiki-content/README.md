# Wiki Content

This directory contains pre-written content for the GitHub wiki.

## 📚 Contents

| File | Description | Wiki Page Title |
|------|-------------|-----------------|
| `Home.md` | Wiki landing page with navigation | Home |
| `Quick-Start.md` | 5-minute setup guide | Quick Start |
| `FAQ.md` | Frequently asked questions | FAQ |
| `Troubleshooting.md` | Common issues and solutions | Troubleshooting |
| `Community-Guide.md` | Contribution guidelines | Community Guide |
| `Development-Tips.md` | Development best practices | Development Tips |
| `Deployment-Checklist.md` | Production deployment steps | Deployment Checklist |
| `_Sidebar.md` | Wiki navigation sidebar | (Custom Sidebar) |

## 🚀 Quick Setup

### Option 1: Manual (Easiest)

1. Go to https://github.com/iaminawe/nelson-tech/wiki
2. Create new pages with titles matching above
3. Copy/paste content from each `.md` file

### Option 2: Git Clone

```bash
# Clone the wiki
git clone https://github.com/iaminawe/nelson-tech.wiki.git
cd nelson-tech.wiki

# Copy content
cp ../wiki-content/*.md .
rm README.md WIKI_SETUP_INSTRUCTIONS.md

# Push
git add .
git commit -m "docs: add comprehensive wiki documentation"
git push origin master
```

### Option 3: Automated Script

```bash
# Run the upload script
chmod +x upload-wiki.sh
./upload-wiki.sh
```

## 📖 Full Instructions

See **[WIKI_SETUP_INSTRUCTIONS.md](WIKI_SETUP_INSTRUCTIONS.md)** for complete setup guide.

## 🔗 Structure

```
wiki-content/
├── README.md                        # This file
├── WIKI_SETUP_INSTRUCTIONS.md       # Detailed setup guide
├── Home.md                          # Landing page
├── Quick-Start.md                   # Getting started
├── FAQ.md                          # Common questions
├── Troubleshooting.md              # Problem solving
├── Community-Guide.md              # Contributing
├── Development-Tips.md             # Best practices
├── Deployment-Checklist.md         # Production deployment
└── _Sidebar.md                     # Wiki navigation
```

## ✨ Features

### Home Page
- Quick navigation to all pages
- Links to MkDocs documentation
- Feature highlights
- Getting started guide

### Quick Start
- 5-minute setup guide
- Environment configuration
- Database setup
- First steps

### FAQ
- General questions
- Setup & installation
- Development
- Features
- Deployment
- Troubleshooting

### Troubleshooting
- Installation issues
- Build errors
- Database problems
- TypeScript errors
- Testing issues
- Deployment problems
- Performance issues

### Community Guide
- Ways to contribute
- Development workflow
- Code style
- Pull request process
- Testing guidelines
- Documentation

### Development Tips
- VS Code setup
- Performance tips
- Debugging
- Testing
- Git tips
- TypeScript tricks
- Tailwind CSS
- Supabase

### Deployment Checklist
- Pre-deployment checks
- Environment setup
- Platform-specific guides
- Post-deployment verification
- Monitoring setup
- Rollback procedures

### Sidebar Navigation
- Quick links to all pages
- Links to GitHub
- Links to MkDocs site
- Documentation sections

## 🎯 Purpose

### Wiki (This Content)
Community-focused documentation:
- Quick start guides
- FAQs and troubleshooting
- Community contribution guides
- Development tips

### MkDocs Site
Technical documentation:
- Architecture and patterns
- API references
- Feature documentation
- Comprehensive guides

Both complement each other for complete coverage.

## 🔄 Updating

To update wiki content:

1. Edit files in this directory
2. Copy updated content to wiki
3. Or use git method to push changes

## 📝 Customization

Before uploading, you may want to customize:

- Repository URLs (if forked)
- MkDocs site URL (if deployed elsewhere)
- Community links (Slack/Discord)
- Contact information

## 📚 Resources

- [GitHub Wiki Docs](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- [Markdown Guide](https://www.markdownguide.org/)
- [MkDocs Documentation](https://iaminawe.github.io/nelson-tech/)

---

**Ready to populate your wiki? See [WIKI_SETUP_INSTRUCTIONS.md](WIKI_SETUP_INSTRUCTIONS.md)!**
