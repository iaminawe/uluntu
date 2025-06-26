#!/bin/bash

# Run the company slug migration
# This script adds slug column to companies table and generates slugs for existing companies

echo "🚀 Running company slug migration..."
echo ""

# Load environment variables
source .env.local

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    exit 1
fi

# Run the migration
echo "📝 Applying migration to add slug column and generate slugs..."
psql "$DATABASE_URL" -f database/migrations/007_add_company_slugs.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Visit /admin/utils/update-company-slugs to verify all companies have slugs"
    echo "2. Test company pages using both ID and slug URLs"
    echo "3. Update any hardcoded company links to use slugs"
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi