#!/bin/bash

# Script to load the fixed groups seed data

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📥 Loading Groups Seed Data${NC}"
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

echo -e "${YELLOW}📝 This will load 10 diverse tech groups with members, events, and resources${NC}"
echo ""

# Check if there are existing groups with invalid UUIDs
invalid_count=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) 
    FROM groups 
    WHERE id LIKE 'g%';" 2>/dev/null | tr -d ' ')

if [ -n "$invalid_count" ] && [ "$invalid_count" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Found $invalid_count groups with invalid UUIDs${NC}"
    read -p "Delete these invalid groups before loading new data? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Deleting invalid groups...${NC}"
        psql "$DATABASE_URL" <<EOF
BEGIN;
DELETE FROM group_members WHERE group_id LIKE 'g%';
DELETE FROM groups WHERE id LIKE 'g%';
COMMIT;
EOF
        echo -e "${GREEN}✅ Invalid groups deleted${NC}"
    fi
    echo ""
fi

# Load the fixed seed data
echo -e "${YELLOW}📥 Loading fixed groups seed data...${NC}"
output=$(psql "$DATABASE_URL" -f database/seeds/07_groups_comprehensive_seed_data_fixed.sql 2>&1)
result=$?

if [ $result -eq 0 ]; then
    echo -e "${GREEN}✅ Groups loaded successfully!${NC}"
else
    echo -e "${RED}❌ Failed to load groups${NC}"
    echo -e "${RED}Error details:${NC}"
    echo "$output" | grep -E "(ERROR|DETAIL|HINT)" | head -10
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Show statistics
group_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM groups;" | tr -d ' ')
member_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM group_members;" | tr -d ' ')
featured_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM groups WHERE featured = true;" | tr -d ' ')

echo -e "Total groups: ${GREEN}${group_count}${NC}"
echo -e "Featured groups: ${GREEN}${featured_count}${NC}"
echo -e "Group memberships: ${GREEN}${member_count}${NC}"
echo ""

echo -e "${YELLOW}📋 Groups by visibility:${NC}"
psql "$DATABASE_URL" -t -c "
    SELECT 
        '  ' || visibility || ': ' || COUNT(*)
    FROM groups 
    GROUP BY visibility
    ORDER BY visibility;"

echo ""
echo -e "${YELLOW}📋 Featured groups:${NC}"
psql "$DATABASE_URL" -t -c "
    SELECT '  • ' || name 
    FROM groups 
    WHERE featured = true
    ORDER BY name;"

echo ""
echo -e "${GREEN}🎉 Groups setup complete!${NC}"
echo ""
echo -e "You can now visit ${CYAN}/groups${NC} to see the group listings"
echo ""

# Make script executable
chmod +x scripts/load-groups-seed.sh