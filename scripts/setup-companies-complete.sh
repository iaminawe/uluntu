#!/bin/bash

# Complete setup script for companies with slugs and social media

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Complete Company Setup Script${NC}"
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
    psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${description} completed${NC}"
        return 0
    else
        echo -e "${RED}❌ ${description} failed${NC}"
        return 1
    fi
}

# Step 1: Add slug column migration
echo -e "${CYAN}Step 1: Adding slug column to companies table${NC}"
if psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='companies' AND column_name='slug';" | grep -q slug; then
    echo -e "${GREEN}✅ Slug column already exists${NC}"
else
    run_sql "Adding slug column" "database/migrations/007_add_company_slugs.sql"
fi
echo ""

# Step 2: Add social column migration
echo -e "${CYAN}Step 2: Adding social column to companies table${NC}"
if psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='companies' AND column_name='social';" | grep -q social; then
    echo -e "${GREEN}✅ Social column already exists${NC}"
else
    run_sql "Adding social column" "database/migrations/008_add_company_social_field.sql"
fi
echo ""

# Step 3: Load company seed data
echo -e "${CYAN}Step 3: Loading company seed data${NC}"
echo -e "${YELLOW}📝 This will create 15 tech companies with rich profiles${NC}"
run_sql "Loading company data" "database/seeds/08_rich_companies_seed_data.sql"
echo ""

# Step 4: Generate slugs for any companies without them
echo -e "${CYAN}Step 4: Generating slugs for companies${NC}"
psql "$DATABASE_URL" -f database/scripts/generate_company_slugs.sql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Slugs generated successfully${NC}"
else
    echo -e "${RED}❌ Slug generation failed${NC}"
fi
echo ""

# Show summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Final Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Company count
company_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies;" | tr -d ' ')
featured_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies WHERE featured = true;" | tr -d ' ')
with_slugs=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies WHERE slug IS NOT NULL;" | tr -d ' ')
with_social=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM companies WHERE social IS NOT NULL;" | tr -d ' ')

echo -e "  Total companies: ${GREEN}${company_count}${NC}"
echo -e "  Featured companies: ${GREEN}${featured_count}${NC}"
echo -e "  Companies with slugs: ${GREEN}${with_slugs}${NC}"
echo -e "  Companies with social media: ${GREEN}${with_social}${NC}"
echo ""

# Show some sample companies
echo -e "${YELLOW}📋 Sample Companies:${NC}"
psql "$DATABASE_URL" -t -c "
    SELECT 
        '  • ' || name || ' (' || location || ') - /' || slug
    FROM companies 
    WHERE slug IS NOT NULL 
    ORDER BY featured DESC, created_at DESC 
    LIMIT 5;"

echo ""
echo -e "${GREEN}🎉 Company setup complete!${NC}"
echo ""
echo -e "${YELLOW}You can now:${NC}"
echo -e "  • Visit ${CYAN}/companies${NC} to see the company listing"
echo -e "  • Click on any company to see their detail page with slugs"
echo -e "  • View social media links on company detail pages"
echo ""