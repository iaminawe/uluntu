#!/bin/bash

# Script to run slug migrations locally
# This adds slug fields to all content tables and generates initial slugs

echo "🔄 Running slug migrations..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

# Run migrations
echo -e "${YELLOW}Applying slug migrations...${NC}"

# Option 1: Use Supabase CLI (if configured)
if [ -f .env.local ]; then
    source .env.local
    if [ ! -z "$SUPABASE_DB_URL" ]; then
        echo "Using database URL from .env.local"
        npx supabase db push --db-url "$SUPABASE_DB_URL"
    fi
fi

# Option 2: Manual migration info
echo ""
echo -e "${GREEN}Manual Migration Instructions:${NC}"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run the following migrations in order:"
echo ""
echo "   - /supabase/migrations/20250819000030_add_slug_to_members.sql"
echo "   - /supabase/migrations/20250819000031_add_slugs_to_all_content.sql"
echo ""
echo "4. After running, verify the slugs were generated:"
echo "   SELECT COUNT(*) FROM members WHERE slug IS NOT NULL;"
echo "   SELECT COUNT(*) FROM events WHERE slug IS NOT NULL;"
echo "   SELECT COUNT(*) FROM opportunities WHERE slug IS NOT NULL;"
echo "   SELECT COUNT(*) FROM groups WHERE slug IS NOT NULL;"
echo ""
echo -e "${GREEN}✅ Migration files are ready to be applied${NC}"