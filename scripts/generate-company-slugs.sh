#!/bin/bash

# Script to generate slugs for companies that don't have them

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Company Slug Generator${NC}"
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

echo -e "${YELLOW}📊 Generating slugs for companies...${NC}"
echo ""

# Run the SQL script
psql "$DATABASE_URL" -f database/scripts/generate_company_slugs.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Company slugs generated successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Summary:${NC}"
    psql "$DATABASE_URL" -t -c "
        SELECT 
            '  Total companies: ' || COUNT(*) || E'\n' ||
            '  Companies with slugs: ' || COUNT(slug) || E'\n' ||
            '  Companies without slugs: ' || (COUNT(*) - COUNT(slug))
        FROM companies;"
    echo ""
    echo -e "${GREEN}🎉 All done! Your companies now have SEO-friendly URLs.${NC}"
else
    echo -e "${RED}❌ Error generating slugs. Please check your database connection.${NC}"
    exit 1
fi