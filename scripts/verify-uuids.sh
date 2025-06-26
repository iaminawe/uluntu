#!/bin/bash

# Script to verify all UUIDs in the database are valid

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 UUID Verification Script${NC}"
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

# Function to check UUIDs in a table
check_table_uuids() {
    local table=$1
    local column=${2:-id}
    
    echo -e "${YELLOW}Checking $table.$column...${NC}"
    
    # Count total rows
    total=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" | tr -d ' ')
    
    # Find invalid UUIDs
    invalid=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*) 
        FROM $table 
        WHERE $column !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND $column IS NOT NULL;" | tr -d ' ')
    
    if [ "$invalid" -eq "0" ]; then
        echo -e "  ${GREEN}✅ All $total UUIDs are valid${NC}"
    else
        echo -e "  ${RED}❌ Found $invalid invalid UUIDs out of $total${NC}"
        
        # Show examples of invalid UUIDs
        echo -e "  ${RED}Invalid examples:${NC}"
        psql "$DATABASE_URL" -t -c "
            SELECT '    - ' || $column 
            FROM $table 
            WHERE $column !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            AND $column IS NOT NULL
            LIMIT 5;"
    fi
    echo ""
}

# Check all tables with UUID columns
echo -e "${CYAN}Checking primary key UUIDs:${NC}"
echo ""
check_table_uuids "members"
check_table_uuids "companies"
check_table_uuids "groups"
check_table_uuids "events"
check_table_uuids "news"
check_table_uuids "resources"
check_table_uuids "marketplace_listings"
check_table_uuids "opportunities"
check_table_uuids "galleries"

echo -e "${CYAN}Checking foreign key UUIDs:${NC}"
echo ""
check_table_uuids "group_members" "group_id"
check_table_uuids "group_members" "member_id"
check_table_uuids "company_members" "company_id"
check_table_uuids "company_members" "member_id"
check_table_uuids "event_attendees" "event_id"
check_table_uuids "event_attendees" "member_id"

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if any invalid UUIDs exist
total_invalid=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) FROM (
        SELECT id FROM members WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM companies WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM groups WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM events WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM news WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) invalid_ids;" | tr -d ' ')

if [ "$total_invalid" -eq "0" ]; then
    echo -e "${GREEN}🎉 All UUIDs in the database are valid!${NC}"
else
    echo -e "${RED}⚠️  Found $total_invalid invalid UUIDs total${NC}"
    echo -e "${YELLOW}Run the fixed seed files to resolve these issues.${NC}"
fi
echo ""

# Make script executable
chmod +x scripts/verify-uuids.sh