#!/bin/bash
# Sync Documentation to GitHub Wiki
# This script helps sync key documentation pages to the GitHub Wiki

set -e

WIKI_DIR="/tmp/nelson-tech.wiki"
DOCS_DIR="$(pwd)/docs"
WIKI_REPO="https://github.com/iaminawe/nelson-tech.wiki.git"

echo "🚀 Syncing documentation to GitHub Wiki..."

# Clone or pull wiki repo
if [ -d "$WIKI_DIR" ]; then
  echo "📥 Pulling latest wiki changes..."
  cd "$WIKI_DIR"
  git pull origin master
else
  echo "📥 Cloning wiki repository..."
  git clone "$WIKI_REPO" "$WIKI_DIR"
  cd "$WIKI_DIR"
fi

echo "✅ Wiki repository ready at: $WIKI_DIR"
echo ""
echo "📝 Wiki pages created:"
echo "  - Home.md (main landing page)"
echo "  - Getting-Started.md (setup guide)"
echo "  - Hybrid-State-Management.md (architecture guide)"
echo ""
echo "🌐 View the wiki at: https://github.com/iaminawe/nelson-tech/wiki"
echo ""
echo "To add more pages:"
echo "  1. Create markdown files in: $WIKI_DIR"
echo "  2. Commit: cd $WIKI_DIR && git add . && git commit -m 'your message'"
echo "  3. Push: git push origin master"
echo ""
echo "Note: GitHub Wiki pages use flat structure (no subdirectories)"
echo "      Use naming like 'Feature-Gallery-System.md' for organization"
