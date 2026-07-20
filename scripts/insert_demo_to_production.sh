#!/bin/bash

# Script to safely insert demo content into production Supabase
# This script uses the service role key to execute the SQL directly

set -e

echo "🚀 Inserting fresh demo content into production Supabase..."
echo ""

# Check if environment variables are set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found"
    echo "Please make sure your .env file is loaded"
    exit 1
fi

# Production database connection
DB_URL="postgresql://postgres:[YOUR-DB-PASSWORD]@db.opkqtpmmtvprhfyjmkhx.supabase.co:5432/postgres"

echo "📋 About to insert the following demo content:"
echo "  • 10 Members (Sarah Mitchell, Marcus Chen, etc.)"
echo "  • 10 Companies (TechFlow Solutions, CloudPeak Technologies, etc.)"
echo "  • 5 Events (AI Summit, Web Dev Workshop, etc.)"
echo "  • 5 Groups (Web Developers Guild, AI Enthusiasts, etc.)"  
echo "  • 5 Marketplace listings"
echo "  • 5 News articles"
echo "  • 5 Resources"
echo "  • 5 Job opportunities"
echo ""
echo "⚠️  This uses unique UUIDs and will NOT overwrite existing data"
echo ""

read -p "Continue with production insert? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔄 Executing SQL script..."

# You'll need to replace [YOUR-DB-PASSWORD] with your actual database password
# Get it from: Supabase Dashboard > Settings > Database > Connection string

# Uncomment and modify this line with your actual password:
# psql "postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.opkqtpmmtvprhfyjmkhx.supabase.co:5432/postgres" -f database/fresh_demo_content_final.sql

echo ""
echo "⚠️  TO COMPLETE SETUP:"
echo "1. Get your database password from Supabase Dashboard > Settings > Database"
echo "2. Replace [YOUR-DB-PASSWORD] in this script with the actual password"
echo "3. Uncomment the psql line at the bottom of this script"
echo "4. Run this script again"
echo ""
echo "💡 Alternative: Use Supabase SQL Editor to copy/paste the content from:"
echo "   database/fresh_demo_content_final.sql"