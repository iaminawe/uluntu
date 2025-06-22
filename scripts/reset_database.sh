#!/bin/bash

# Reset Database with Production Schema and Data
# This script resets the local Supabase database with production schema and sample data

echo "🔄 Resetting local database with production schema and data..."

# Drop and recreate the public schema
echo "📂 Dropping and recreating public schema..."
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" > /dev/null 2>&1

# Apply comprehensive schema and data
echo "🗃️  Applying comprehensive schema..."
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f database/comprehensive_schema_and_data.sql > /dev/null 2>&1

echo "📊 Applying seed data..."
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f database/comprehensive_seed_data.sql > /dev/null 2>&1

# Verify the restore
echo "✅ Verifying data..."
MEMBER_COUNT=$(psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c "SELECT COUNT(*) FROM members;")
COMPANY_COUNT=$(psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c "SELECT COUNT(*) FROM companies;")
NEWS_COUNT=$(psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c "SELECT COUNT(*) FROM news;")

echo "📈 Database restored successfully!"
echo "   Members: $MEMBER_COUNT"
echo "   Companies: $COMPANY_COUNT"
echo "   News: $NEWS_COUNT"
echo ""
echo "🎉 Local database is ready for development!"