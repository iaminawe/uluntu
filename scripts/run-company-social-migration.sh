#!/bin/bash

# Script to add social field to companies table

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Adding social field to companies table...${NC}"
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

# Run the migration
echo -e "${YELLOW}📝 Running migration to add social field...${NC}"
psql "$DATABASE_URL" -f database/migrations/008_add_company_social_field.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Social field added successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Verifying column exists...${NC}"
    psql "$DATABASE_URL" -c "\d companies" | grep social
    echo ""
    echo -e "${GREEN}🎉 Migration complete! You can now run the companies seed file.${NC}"
else
    echo -e "${RED}❌ Migration failed. Please check your database connection and try again.${NC}"
    exit 1
fi