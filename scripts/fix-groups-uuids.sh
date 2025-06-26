#!/bin/bash

# Script to fix invalid group UUIDs

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Fix Groups UUIDs Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check if required variables are set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env.local${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking for groups with invalid UUIDs...${NC}"

# Check if there are any groups with UUIDs starting with 'g'
invalid_count=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) 
    FROM groups 
    WHERE id LIKE 'g%';" | tr -d ' ')

if [ "$invalid_count" -eq "0" ]; then
    echo -e "${GREEN}✅ No invalid group UUIDs found!${NC}"
    echo ""
    exit 0
fi

echo -e "${RED}Found $invalid_count groups with invalid UUIDs${NC}"
echo ""

# Show the invalid groups
echo -e "${YELLOW}Groups with invalid UUIDs:${NC}"
psql "$DATABASE_URL" -c "
    SELECT id, name 
    FROM groups 
    WHERE id LIKE 'g%'
    ORDER BY name;"

echo ""
read -p "Do you want to delete these groups and reload with valid UUIDs? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Operation cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Deleting groups with invalid UUIDs...${NC}"

# First delete related data
psql "$DATABASE_URL" <<EOF
BEGIN;

-- Delete group members
DELETE FROM group_members WHERE group_id LIKE 'g%';

-- Delete groups
DELETE FROM groups WHERE id LIKE 'g%';

COMMIT;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Invalid groups deleted${NC}"
else
    echo -e "${RED}❌ Failed to delete invalid groups${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📥 Loading fixed groups seed data...${NC}"

# Load the fixed seed data
psql "$DATABASE_URL" -f database/seeds/07_groups_comprehensive_seed_data_fixed.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Fixed groups loaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to load fixed groups${NC}"
    echo -e "${YELLOW}Try running: psql \"$DATABASE_URL\" -f database/seeds/07_groups_comprehensive_seed_data_fixed.sql${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Results${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Show new groups
group_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM groups;" | tr -d ' ')
echo -e "Total groups: ${GREEN}${group_count}${NC}"
echo ""

echo -e "${YELLOW}New groups:${NC}"
psql "$DATABASE_URL" -t -c "
    SELECT '  • ' || name || ' (ID: ' || id || ')'
    FROM groups 
    ORDER BY created_at DESC 
    LIMIT 10;"

echo ""
echo -e "${GREEN}🎉 Groups UUID fix complete!${NC}"
echo ""

# Make script executable
chmod +x scripts/fix-groups-uuids.sh