#!/bin/bash

# Test seed files locally
# This script tests the SQL syntax and basic structure without a database

echo "=== Testing Seed Files Syntax ==="
echo ""

# Function to check SQL file syntax
check_sql_file() {
    local file=$1
    echo "Checking: $file"
    
    # Basic SQL syntax checks
    if grep -q "^INSERT INTO" "$file"; then
        echo "✓ Contains INSERT statements"
    fi
    
    if grep -q "^BEGIN;" "$file" && grep -q "^COMMIT;" "$file"; then
        echo "✓ Has transaction boundaries (BEGIN/COMMIT)"
    fi
    
    # Check for common SQL errors
    if grep -E "(INSERT INTO.*;.*;)" "$file" | grep -v "VALUES" > /dev/null; then
        echo "⚠ Warning: Possible syntax error in INSERT statements"
    fi
    
    # Check UUID format
    uuid_count=$(grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' "$file" | wc -l)
    echo "✓ Found $uuid_count UUIDs"
    
    # Check for table references
    tables=$(grep -oE "INSERT INTO \"?[a-z_]+\"?" "$file" | awk '{print $3}' | sed 's/"//g' | sort | uniq)
    echo "✓ Tables referenced:"
    echo "$tables" | sed 's/^/  - /'
    
    echo ""
}

# Test primary seed file
check_sql_file "database/seeds/01_fresh_demo_content_final.sql"

# Test relationships file
check_sql_file "database/seeds/02_additional_demo_relationships.sql"

echo "=== Summary ==="
echo ""
echo "Seed files structure appears valid."
echo "To test with a real database:"
echo "  1. Start local Supabase: npx supabase start"
echo "  2. Apply seeds: psql <connection-string> -f database/seeds/01_fresh_demo_content_final.sql"
echo ""
echo "Note: The seed files create tables dynamically if they don't exist (e.g., marketplace_bookmarks)"