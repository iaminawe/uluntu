#!/bin/bash

echo "Applying conversation system fixes..."
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will apply the following fixes:${NC}"
echo "1. Add notification_settings column if missing"
echo "2. Fix infinite recursion in RLS policies"
echo "3. Ensure proper permissions for conversations"
echo ""

# Check if Supabase CLI is configured
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI found${NC}"
    
    # Apply the migration
    echo ""
    echo "Applying migration..."
    supabase db push --db-url "$DATABASE_URL" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migration applied successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Could not apply via Supabase CLI. Use manual method below.${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Supabase CLI not found${NC}"
fi

echo ""
echo "====================================="
echo "MANUAL APPLICATION (if needed):"
echo "====================================="
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and run the migration from:"
echo "   supabase/migrations/20250821000001_fix_conversation_participants_column.sql"
echo ""
echo "====================================="
echo ""
echo "After applying the migration, test at:"
echo "http://localhost:5557/test-conversations"
echo ""