#!/bin/bash
# Script to organize SQL files into appropriate directories

echo "Organizing SQL files..."

# Create archive directory for old files
mkdir -p database/archive/old_seeds
mkdir -p database/archive/old_fixes
mkdir -p database/archive/old_checks

# Move migration files
echo "Moving migration files..."
mv add_member_profile_fields.sql database/migrations/applied/001_add_member_profile_fields.sql 2>/dev/null
mv add_member_interests.sql database/migrations/applied/002_add_member_interests.sql 2>/dev/null
mv create_tags_system.sql database/migrations/applied/003_create_tags_system.sql 2>/dev/null
mv add_tags_to_resources.sql database/migrations/applied/004_add_tags_to_resources.sql 2>/dev/null
mv apply_admin_migration_fixed.sql database/migrations/applied/005_apply_admin_migration.sql 2>/dev/null
mv apply_newsletter_migration.sql database/migrations/applied/006_apply_newsletter_migration.sql 2>/dev/null

# Move current fixes
echo "Moving current fixes..."
mv fix_user_roles_simple.sql database/fixes/fix_user_roles_simple.sql 2>/dev/null
mv fix_events_simple.sql database/fixes/fix_events_simple.sql 2>/dev/null
mv fix_admin_rls_policies_corrected.sql database/fixes/fix_admin_rls_policies_corrected.sql 2>/dev/null
mv fix_group_members_rls.sql database/fixes/fix_group_members_rls.sql 2>/dev/null
mv fix_groups_rls_recursion.sql database/fixes/fix_groups_rls_recursion.sql 2>/dev/null
mv fix_newsletter_rls_policies.sql database/fixes/fix_newsletter_rls_policies.sql 2>/dev/null
mv fix_member_profile_complete.sql database/fixes/fix_member_profile_complete.sql 2>/dev/null

# Move admin scripts
echo "Moving admin scripts..."
mkdir -p database/admin
mv assign_superadmin_role.sql database/admin/ 2>/dev/null
mv assign_superadmin_to_user.sql database/admin/ 2>/dev/null
mv check_and_assign_superadmin.sql database/admin/ 2>/dev/null

# Move diagnostic scripts
echo "Moving diagnostic scripts..."
mkdir -p database/diagnostics
mv check_rls_policies.sql database/diagnostics/ 2>/dev/null
mv check_current_rls_status.sql database/diagnostics/ 2>/dev/null
mv check_rls_enabled.sql database/diagnostics/ 2>/dev/null
mv check_user_roles_structure.sql database/diagnostics/ 2>/dev/null
mv check-all-schemas.sql database/diagnostics/ 2>/dev/null
mv check-events-schema.sql database/diagnostics/ 2>/dev/null
mv check-groups-columns.sql database/diagnostics/ 2>/dev/null
mv diagnose_rls_issues.sql database/diagnostics/ 2>/dev/null
mv test_member_profile_data.sql database/diagnostics/ 2>/dev/null
mv test_member_profile_updates.sql database/diagnostics/ 2>/dev/null

# Move main seed files
echo "Moving main seed files..."
mv database_seed_script.sql database/seeds/01_database_seed_script.sql 2>/dev/null
mv seed_tags_system.sql database/seeds/02_seed_tags_system.sql 2>/dev/null
mv seed_resources_marketplace_fixed.sql database/seeds/03_seed_resources_marketplace.sql 2>/dev/null

# Archive old seed files
echo "Archiving old seed files..."
mv seed_*.sql database/archive/old_seeds/ 2>/dev/null
mv fix_member_profile_trigger_draft.sql database/archive/old_seeds/ 2>/dev/null

# Archive old fix files
echo "Archiving old fix files..."
mv fix_user_roles_rls*.sql database/archive/old_fixes/ 2>/dev/null
mv fix_events_rls*.sql database/archive/old_fixes/ 2>/dev/null
mv fix_companies_events*.sql database/archive/old_fixes/ 2>/dev/null
mv fix_admin_rls_policies.sql database/archive/old_fixes/ 2>/dev/null
mv fix_all_rls_policies.sql database/archive/old_fixes/ 2>/dev/null
mv fix_rls_remove_problematic_policies.sql database/archive/old_fixes/ 2>/dev/null
mv fix_member_profile_fields.sql database/archive/old_fixes/ 2>/dev/null

# Archive minimal tags system (we're using the full version)
mv create_minimal_tags_system.sql database/archive/ 2>/dev/null

echo "SQL files organized successfully!"
echo ""
echo "New structure:"
echo "database/"
echo "├── setup_database.sql (master setup script)"
echo "├── migrations/"
echo "│   └── applied/ (all applied migrations)"
echo "├── seeds/"
echo "│   ├── consolidated_seed_data.sql (main consolidated seed)"
echo "│   └── individual seed files..."
echo "├── fixes/"
echo "│   ├── consolidated_rls_fixes.sql (main RLS fix)"
echo "│   └── individual fix files..."
echo "├── admin/ (superadmin setup scripts)"
echo "├── diagnostics/ (check and diagnostic queries)"
echo "└── archive/ (old/obsolete files for reference)"
echo ""
echo "To set up a fresh database, run: database/setup_database.sql"