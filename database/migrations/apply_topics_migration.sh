#!/bin/bash

# Topics System Migration Script
# This script applies the topics system migration to the database

set -e

echo "Starting Topics System Migration..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '#' | xargs)
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL not set. Please check your .env.local file."
    exit 1
fi

# Run the migration
echo "Creating topics tables and relationships..."
psql "$SUPABASE_DB_URL" -f database/migrations/007_create_topics_system.sql

if [ $? -eq 0 ]; then
    echo "Topics system migration completed successfully!"
    
    # Move migration to applied folder
    mkdir -p database/migrations/applied
    cp database/migrations/007_create_topics_system.sql database/migrations/applied/
    
    echo "Migration file moved to applied folder."
else
    echo "Error: Migration failed. Please check the error messages above."
    exit 1
fi

echo "Topics system is now ready for use!"