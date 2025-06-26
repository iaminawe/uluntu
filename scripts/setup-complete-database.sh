#!/bin/bash

# Complete database setup script for companies and groups
# This script ensures all migrations and seed data are applied in the correct order

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Complete Database Setup Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local with your database connection details"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check if required variables are set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env.local${NC}"
    exit 1
fi

# Function to run SQL and check result
run_sql() {
    local description=$1
    local sql_file=$2
    
    echo -e "${YELLOW}🔧 ${description}...${NC}"
    
    # Run the SQL and capture both stdout and stderr
    output=$(psql "$DATABASE_URL" -f "$sql_file" 2>&1)
    result=$?
    
    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✅ ${description} completed${NC}"
        return 0
    else
        echo -e "${RED}❌ ${description} failed${NC}"
        echo -e "${RED}Error details:${NC}"
        echo "$output" | grep -E "(ERROR|DETAIL|HINT)" | head -10
        return 1
    fi
}

# Step 1: Run migrations
echo -e "${CYAN}Step 1: Running database migrations${NC}"
echo ""

# Add slug column to companies
if psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='companies' AND column_name='slug';" | grep -q slug; then
    echo -e "${GREEN}✅ Slug column already exists${NC}"
else
    run_sql "Adding slug column" "database/migrations/007_add_company_slugs.sql"
fi

# Add social column to companies
if psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='companies' AND column_name='social';" | grep -q social; then
    echo -e "${GREEN}✅ Social column already exists${NC}"
else
    run_sql "Adding social column" "database/migrations/008_add_company_social_field.sql"
fi
echo ""

# Step 2: Load seed data
echo -e "${CYAN}Step 2: Loading seed data${NC}"
echo ""

# Check if we already have companies
company_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies;" | tr -d ' ')
if [ "$company_count" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Found $company_count existing companies${NC}"
    read -p "Do you want to load new company seed data? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_sql "Loading company data" "database/seeds/08_rich_companies_seed_data.sql"
    else
        echo -e "${BLUE}Skipping company seed data${NC}"
    fi
else
    run_sql "Loading company data" "database/seeds/08_rich_companies_seed_data.sql"
fi

# Check if we already have groups
group_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM groups;" | tr -d ' ')
if [ "$group_count" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Found $group_count existing groups${NC}"
    read -p "Do you want to load new group seed data? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Use the fixed groups seed file
        run_sql "Loading group data" "database/seeds/07_groups_comprehensive_seed_data_fixed.sql"
    else
        echo -e "${BLUE}Skipping group seed data${NC}"
    fi
else
    # Use the fixed groups seed file
    run_sql "Loading group data" "database/seeds/07_groups_comprehensive_seed_data_fixed.sql"
fi
echo ""

# Step 3: Generate slugs for companies
echo -e "${CYAN}Step 3: Generating slugs for companies${NC}"
psql "$DATABASE_URL" -f database/scripts/generate_company_slugs.sql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Slugs generated successfully${NC}"
else
    echo -e "${RED}❌ Slug generation failed${NC}"
fi
echo ""

# Step 4: Verify data integrity
echo -e "${CYAN}Step 4: Verifying data integrity${NC}"
echo ""

# Check for invalid UUIDs
echo -e "${YELLOW}Checking for invalid UUIDs...${NC}"
invalid_count=$(psql "$DATABASE_URL" -t -c "
    SELECT COUNT(*) FROM (
        SELECT id FROM groups WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        UNION ALL
        SELECT id FROM companies WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) invalid_ids;" | tr -d ' ')

if [ "$invalid_count" -eq "0" ]; then
    echo -e "${GREEN}✅ All UUIDs are valid${NC}"
else
    echo -e "${RED}❌ Found $invalid_count invalid UUIDs${NC}"
fi
echo ""

# Show summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Final Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Company statistics
company_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies;" | tr -d ' ')
featured_companies=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies WHERE featured = true;" | tr -d ' ')
companies_with_slugs=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies WHERE slug IS NOT NULL;" | tr -d ' ')
companies_with_social=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies WHERE social IS NOT NULL AND social != '{}'::jsonb;" | tr -d ' ')

echo -e "${CYAN}Companies:${NC}"
echo -e "  Total: ${GREEN}${company_count}${NC}"
echo -e "  Featured: ${GREEN}${featured_companies}${NC}"
echo -e "  With slugs: ${GREEN}${companies_with_slugs}${NC}"
echo -e "  With social media: ${GREEN}${companies_with_social}${NC}"
echo ""

# Group statistics
group_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM groups;" | tr -d ' ')
featured_groups=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM groups WHERE featured = true;" | tr -d ' ')
group_members=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM group_members;" | tr -d ' ')

echo -e "${CYAN}Groups:${NC}"
echo -e "  Total: ${GREEN}${group_count}${NC}"
echo -e "  Featured: ${GREEN}${featured_groups}${NC}"
echo -e "  Total memberships: ${GREEN}${group_members}${NC}"
echo ""

# Show sample data
echo -e "${YELLOW}📋 Sample Companies:${NC}"
psql "$DATABASE_URL" -t -c "
    SELECT 
        '  • ' || name || ' (' || location || ') - /' || COALESCE(slug, 'no-slug')
    FROM companies 
    ORDER BY featured DESC, created_at DESC 
    LIMIT 5;"

echo ""
echo -e "${YELLOW}📋 Sample Groups:${NC}"
psql "$DATABASE_URL" -t -c "
    SELECT 
        '  • ' || name || ' - ' || CASE WHEN featured THEN '⭐ Featured' ELSE 'Regular' END
    FROM groups 
    ORDER BY featured DESC, created_at DESC 
    LIMIT 5;"

echo ""
echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Run ${CYAN}npm run dev${NC} to start the development server"
echo -e "  2. Visit ${CYAN}/companies${NC} to see the enhanced company listings"
echo -e "  3. Visit ${CYAN}/groups${NC} to see the group listings"
echo -e "  4. Click on any company to see their detail page with associations"
echo -e "  5. Check ${CYAN}/admin${NC} (requires admin access) for management tools"
echo ""

# Make script executable
chmod +x scripts/setup-complete-database.sh