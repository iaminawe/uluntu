#!/bin/bash

echo "=================================="
echo "COMPLETE CONVERSATION SYSTEM FIX"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This will apply a comprehensive fix that:${NC}"
echo "1. Removes ALL existing conversation policies"
echo "2. Creates new non-recursive policies"
echo "3. Ensures notification_settings column exists"
echo "4. Fixes all permission issues"
echo ""

echo -e "${BLUE}IMPORTANT:${NC}"
echo "Apply this migration in your Supabase SQL Editor:"
echo ""
echo -e "${GREEN}File to run:${NC}"
echo "supabase/migrations/20250821000002_fix_conversation_policies_complete.sql"
echo ""

echo "=================================="
echo "STEPS TO APPLY:"
echo "=================================="
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Click 'New Query'"
echo "4. Copy ALL contents from:"
echo "   ${GREEN}supabase/migrations/20250821000002_fix_conversation_policies_complete.sql${NC}"
echo "5. Paste into SQL Editor"
echo "6. Click 'Run' button"
echo ""

echo "=================================="
echo "WHAT THIS FIXES:"
echo "=================================="
echo ""
echo "✓ Infinite recursion in conversation_participants"
echo "✓ Missing notification_settings column"
echo "✓ Policy conflicts"
echo "✓ Permission issues"
echo ""

echo "=================================="
echo "AFTER APPLYING:"
echo "=================================="
echo ""
echo "Test at: ${BLUE}http://localhost:5557/test-conversations${NC}"
echo ""
echo "All tests should pass:"
echo "- Member profile check ✓"
echo "- Fetch conversations ✓"
echo "- Check participants ✓"
echo "- Find other members ✓"
echo "- Create conversations ✓"
echo ""

echo -e "${YELLOW}Press Enter to open the migration file...${NC}"
read

# Try to open the file in the default editor
if command -v code &> /dev/null; then
    code supabase/migrations/20250821000002_fix_conversation_policies_complete.sql
elif command -v open &> /dev/null; then
    open supabase/migrations/20250821000002_fix_conversation_policies_complete.sql
else
    cat supabase/migrations/20250821000002_fix_conversation_policies_complete.sql
fi