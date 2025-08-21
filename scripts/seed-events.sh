#!/bin/bash

# Script to seed events with sessions and presenters
# Run this after starting Supabase locally

echo "🚀 Seeding comprehensive events data..."

# Check if Supabase is running
npx supabase status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Supabase is not running. Please start it first with: npx supabase start"
    exit 1
fi

# Apply the events seed
echo "📝 Applying events seed data..."
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f database/seeds/09_comprehensive_events_with_sessions.sql

if [ $? -eq 0 ]; then
    echo "✅ Events seeded successfully!"
    echo "📊 Summary:"
    echo "  - 10 comprehensive tech events"
    echo "  - 29 event sessions"
    echo "  - 40+ presenters"
    echo "  - 20+ session resources"
else
    echo "❌ Failed to seed events. Please check the error messages above."
    exit 1
fi