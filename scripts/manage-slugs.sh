#!/bin/bash

# Slug Management Utility Script
# This script provides utilities for managing slugs across content tables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default Supabase connection settings
DB_URL=${DATABASE_URL:-"postgresql://postgres:password@localhost:54322/postgres"}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to execute SQL and show results
execute_sql() {
    local sql="$1"
    local description="$2"
    
    print_status "$description"
    psql "$DB_URL" -c "$sql"
}

# Function to show help
show_help() {
    cat << EOF
Slug Management Utility

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    check           Check slug status across all tables
    regenerate      Regenerate all slugs for a specific table
    duplicates      Find duplicate slugs across all tables
    test           Run slug generation tests
    migrate        Run the slug migration
    help           Show this help message

Options:
    --table TABLE   Specify table for operations (members, events, opportunities, groups, news)
    --dry-run       Show what would be done without executing
    --url URL       Database URL (default: \$DATABASE_URL or local)

Examples:
    $0 check
    $0 regenerate --table members
    $0 duplicates
    $0 test
    $0 migrate

Environment Variables:
    DATABASE_URL    PostgreSQL connection string
EOF
}

# Function to check slug status
check_slugs() {
    print_header "=== Slug Status Report ==="
    
    execute_sql "
    DO \$\$
    DECLARE
        members_total INTEGER := 0;
        members_with_slugs INTEGER := 0;
        events_total INTEGER := 0;
        events_with_slugs INTEGER := 0;
        opportunities_total INTEGER := 0;
        opportunities_with_slugs INTEGER := 0;
        groups_total INTEGER := 0;
        groups_with_slugs INTEGER := 0;
        news_total INTEGER := 0;
        news_with_slugs INTEGER := 0;
    BEGIN
        SELECT COUNT(*) INTO members_total FROM members;
        SELECT COUNT(*) INTO members_with_slugs FROM members WHERE slug IS NOT NULL AND slug != '';
        
        SELECT COUNT(*) INTO events_total FROM events;
        SELECT COUNT(*) INTO events_with_slugs FROM events WHERE slug IS NOT NULL AND slug != '';
        
        SELECT COUNT(*) INTO opportunities_total FROM opportunities;
        SELECT COUNT(*) INTO opportunities_with_slugs FROM opportunities WHERE slug IS NOT NULL AND slug != '';
        
        SELECT COUNT(*) INTO groups_total FROM groups;
        SELECT COUNT(*) INTO groups_with_slugs FROM groups WHERE slug IS NOT NULL AND slug != '';
        
        SELECT COUNT(*) INTO news_total FROM news;
        SELECT COUNT(*) INTO news_with_slugs FROM news WHERE slug IS NOT NULL AND slug != '';
        
        RAISE NOTICE 'Members: % of % have slugs (%.1f%%)', 
                     members_with_slugs, members_total, 
                     CASE WHEN members_total > 0 THEN (members_with_slugs::FLOAT / members_total * 100) ELSE 0 END;
        RAISE NOTICE 'Events: % of % have slugs (%.1f%%)', 
                     events_with_slugs, events_total,
                     CASE WHEN events_total > 0 THEN (events_with_slugs::FLOAT / events_total * 100) ELSE 0 END;
        RAISE NOTICE 'Opportunities: % of % have slugs (%.1f%%)', 
                     opportunities_with_slugs, opportunities_total,
                     CASE WHEN opportunities_total > 0 THEN (opportunities_with_slugs::FLOAT / opportunities_total * 100) ELSE 0 END;
        RAISE NOTICE 'Groups: % of % have slugs (%.1f%%)', 
                     groups_with_slugs, groups_total,
                     CASE WHEN groups_total > 0 THEN (groups_with_slugs::FLOAT / groups_total * 100) ELSE 0 END;
        RAISE NOTICE 'News: % of % have slugs (%.1f%%)', 
                     news_with_slugs, news_total,
                     CASE WHEN news_total > 0 THEN (news_with_slugs::FLOAT / news_total * 100) ELSE 0 END;
    END \$\$;
    " "Checking slug coverage across all tables"
}

# Function to regenerate slugs for a table
regenerate_table_slugs() {
    local table="$1"
    local dry_run="$2"
    
    if [[ ! "$table" =~ ^(members|events|opportunities|groups|news)$ ]]; then
        print_error "Invalid table: $table. Must be one of: members, events, opportunities, groups, news"
        exit 1
    fi
    
    if [[ "$dry_run" == "true" ]]; then
        print_warning "DRY RUN: Would regenerate slugs for table: $table"
        return
    fi
    
    print_header "=== Regenerating Slugs for $table ==="
    
    execute_sql "
    DO \$\$
    DECLARE
        updated_count INTEGER;
    BEGIN
        SELECT regenerate_table_slugs('$table') INTO updated_count;
        RAISE NOTICE 'Updated % records in % table', updated_count, '$table';
    END \$\$;
    " "Regenerating slugs for $table table"
}

# Function to find duplicate slugs
find_duplicates() {
    print_header "=== Checking for Duplicate Slugs ==="
    
    execute_sql "
    SELECT 
        table_name,
        slug,
        count as occurrences
    FROM check_duplicate_slugs()
    ORDER BY table_name, slug;
    " "Checking for duplicate slugs"
}

# Function to run slug tests
run_tests() {
    print_header "=== Running Slug Generation Tests ==="
    
    execute_sql "
    -- Test basic slug generation
    SELECT 
        'Basic Test' as test_name,
        generate_slug_from_text('Hello World! This is a Test') as result,
        'hello-world-this-is-a-test' as expected,
        generate_slug_from_text('Hello World! This is a Test') = 'hello-world-this-is-a-test' as passed;
    
    -- Test special characters
    SELECT 
        'Special Characters' as test_name,
        generate_slug_from_text('Test@#\$%^&*()Title!!!') as result,
        'testtitle' as expected,
        generate_slug_from_text('Test@#\$%^&*()Title!!!') = 'testtitle' as passed;
    
    -- Test multiple spaces
    SELECT 
        'Multiple Spaces' as test_name,
        generate_slug_from_text('Multiple    Spaces   Test') as result,
        'multiple-spaces-test' as expected,
        generate_slug_from_text('Multiple    Spaces   Test') = 'multiple-spaces-test' as passed;
    " "Running slug generation tests"
}

# Function to run the migration
run_migration() {
    print_header "=== Running Slug Migration ==="
    
    local migration_file="supabase/migrations/20250819000030_add_content_table_slugs.sql"
    
    if [[ ! -f "$migration_file" ]]; then
        print_error "Migration file not found: $migration_file"
        exit 1
    fi
    
    print_status "Executing migration: $migration_file"
    psql "$DB_URL" -f "$migration_file"
    
    print_status "Running migration tests"
    psql "$DB_URL" -f "supabase/migrations/20250819000031_test_slug_functionality.sql"
}

# Parse command line arguments
COMMAND=""
TABLE=""
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        check|regenerate|duplicates|test|migrate|help)
            COMMAND="$1"
            shift
            ;;
        --table)
            TABLE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --url)
            DB_URL="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute the requested command
case "$COMMAND" in
    check)
        check_slugs
        ;;
    regenerate)
        if [[ -z "$TABLE" ]]; then
            print_error "Table must be specified for regenerate command"
            print_status "Use: $0 regenerate --table <table_name>"
            exit 1
        fi
        regenerate_table_slugs "$TABLE" "$DRY_RUN"
        ;;
    duplicates)
        find_duplicates
        ;;
    test)
        run_tests
        ;;
    migrate)
        run_migration
        ;;
    help|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac