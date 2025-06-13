#!/bin/bash

# Continue migration script for Nelson Tech
# This script continues the migration for remaining features

set -e

echo "Continuing Nelson Tech Code Migration"
echo "===================================="

# Function to migrate a feature
migrate_feature() {
  local feature=$1
  echo "Migrating $feature feature..."
  
  # Create feature directories if they don't exist
  mkdir -p "src/features/$feature"/{components,hooks,api,store,types,utils,__tests__}
  
  # Move components
  case $feature in
    "companies")
      [ -d "src/components/CompaniesList" ] && cp -r "src/components/CompaniesList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/CompanyProfile" ] && cp -r "src/components/CompanyProfile" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/companiesApi.ts" ] && cp "src/api/companiesApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useCompaniesRedux.ts" ] && cp "src/hooks/useCompaniesRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/hooks/useCompanyQueries.ts" ] && cp "src/hooks/useCompanyQueries.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/companiesSlice.ts" ] && cp "src/redux/slices/companiesSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/companyAdapter.ts" ] && cp "src/adapters/companyAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
      
    "directory")
      [ -d "src/components/DirectoryList" ] && cp -r "src/components/DirectoryList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/MembersList" ] && cp -r "src/components/MembersList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/MemberProfile" ] && cp -r "src/components/MemberProfile" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/membersApi.ts" ] && cp "src/api/membersApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useMembersRedux.ts" ] && cp "src/hooks/useMembersRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/membersSlice.ts" ] && cp "src/redux/slices/membersSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/memberAdapter.ts" ] && cp "src/adapters/memberAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
      
    "events")
      [ -d "src/components/EventsList" ] && cp -r "src/components/EventsList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/EventsCalendar" ] && cp -r "src/components/EventsCalendar" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/eventsApi.ts" ] && cp "src/api/eventsApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useEventsRedux.ts" ] && cp "src/hooks/useEventsRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/eventsSlice.ts" ] && cp "src/redux/slices/eventsSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/eventAdapter.ts" ] && cp "src/adapters/eventAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
      
    "groups")
      [ -d "src/components/GroupsList" ] && cp -r "src/components/GroupsList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/GroupDetails" ] && cp -r "src/components/GroupDetails" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/JoinModal" ] && cp -r "src/components/JoinModal" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/groupsApi.ts" ] && cp "src/api/groupsApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useGroupsRedux.ts" ] && cp "src/hooks/useGroupsRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/groupsSlice.ts" ] && cp "src/redux/slices/groupsSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/groupAdapter.ts" ] && cp "src/adapters/groupAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
      
    "news")
      [ -d "src/components/NewsList" ] && cp -r "src/components/NewsList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/NewsDetail" ] && cp -r "src/components/NewsDetail" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/NewsArticlesList" ] && cp -r "src/components/NewsArticlesList" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/newsApi.ts" ] && cp "src/api/newsApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useNewsRedux.ts" ] && cp "src/hooks/useNewsRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/newsSlice.ts" ] && cp "src/redux/slices/newsSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/newsAdapter.ts" ] && cp "src/adapters/newsAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
      
    "opportunities")
      [ -d "src/components/OpportunitiesList" ] && cp -r "src/components/OpportunitiesList" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/opportunitiesApi.ts" ] && cp "src/api/opportunitiesApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useOpportunitiesRedux.ts" ] && cp "src/hooks/useOpportunitiesRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/opportunitiesSlice.ts" ] && cp "src/redux/slices/opportunitiesSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/opportunityAdapter.ts" ] && cp "src/adapters/opportunityAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
      
    "resources")
      [ -d "src/components/ResourcesList" ] && cp -r "src/components/ResourcesList" "src/features/$feature/components/" 2>/dev/null || true
      [ -d "src/components/ResourcesPreview" ] && cp -r "src/components/ResourcesPreview" "src/features/$feature/components/" 2>/dev/null || true
      [ -f "src/api/resourcesApi.ts" ] && cp "src/api/resourcesApi.ts" "src/features/$feature/api/" 2>/dev/null || true
      [ -f "src/hooks/useResourcesRedux.ts" ] && cp "src/hooks/useResourcesRedux.ts" "src/features/$feature/hooks/" 2>/dev/null || true
      [ -f "src/redux/slices/resourcesSlice.ts" ] && cp "src/redux/slices/resourcesSlice.ts" "src/features/$feature/store/" 2>/dev/null || true
      [ -f "src/adapters/resourceAdapter.ts" ] && cp "src/adapters/resourceAdapter.ts" "src/features/$feature/utils/" 2>/dev/null || true
      ;;
  esac
  
  # Create barrel export
  cat > "src/features/$feature/index.ts" << EOF
// Export all public APIs from the $feature feature
export * from './components';
export * from './hooks';
export * from './api';
export * from './store';
export * from './types';
EOF
  
  echo "✓ $feature feature migrated"
}

# Function to move more shared components
migrate_more_shared() {
  echo "Migrating additional shared components..."
  
  # Move more UI components
  [ -d "src/components/RichTextEditor" ] && cp -r "src/components/RichTextEditor" "src/shared/components/ui/" 2>/dev/null || true
  [ -f "src/components/DataSourceIndicator.tsx" ] && cp "src/components/DataSourceIndicator.tsx" "src/shared/components/ui/" 2>/dev/null || true
  
  # Move layout components
  [ -d "src/components/ContactSection" ] && cp -r "src/components/ContactSection" "src/shared/components/layout/" 2>/dev/null || true
  [ -d "src/components/AboutSection" ] && cp -r "src/components/AboutSection" "src/shared/components/layout/" 2>/dev/null || true
  
  # Move content editor (seems shared)
  [ -d "src/components/ContentEditor" ] && cp -r "src/components/ContentEditor" "src/shared/components/" 2>/dev/null || true
  
  # Move lib files
  [ -f "src/lib/supabase.ts" ] && cp "src/lib/supabase.ts" "src/shared/lib/" 2>/dev/null || true
  [ -f "src/lib/supabaseClient.ts" ] && cp "src/lib/supabaseClient.ts" "src/shared/lib/" 2>/dev/null || true
  
  # Move types
  [ -f "src/types/content.ts" ] && cp "src/types/content.ts" "src/shared/types/" 2>/dev/null || true
  [ -f "src/types/supabase.ts" ] && cp "src/types/supabase.ts" "src/shared/types/" 2>/dev/null || true
  
  echo "✓ Additional shared components migrated"
}

# Function to reorganize pages
reorganize_pages() {
  echo "Reorganizing pages directory..."
  
  # Create page subdirectories
  mkdir -p src/pages/{companies,directory,events,groups,marketplace,news,opportunities,resources}
  
  # Move pages to appropriate subdirectories
  [ -f "src/pages/CompaniesPage" ] && mv "src/pages/CompaniesPage" "src/pages/companies/" 2>/dev/null || true
  [ -f "src/pages/CompanyDetailPage" ] && mv "src/pages/CompanyDetailPage" "src/pages/companies/" 2>/dev/null || true
  [ -f "src/pages/CompanyEditPage" ] && mv "src/pages/CompanyEditPage" "src/pages/companies/" 2>/dev/null || true
  
  [ -f "src/pages/DirectoryPage" ] && mv "src/pages/DirectoryPage" "src/pages/directory/" 2>/dev/null || true
  [ -f "src/pages/DirectoryDetailPage" ] && mv "src/pages/DirectoryDetailPage" "src/pages/directory/" 2>/dev/null || true
  [ -f "src/pages/DirectoryEditPage" ] && mv "src/pages/DirectoryEditPage" "src/pages/directory/" 2>/dev/null || true
  
  [ -f "src/pages/EventsPage" ] && mv "src/pages/EventsPage" "src/pages/events/" 2>/dev/null || true
  [ -f "src/pages/EventDetailPage" ] && mv "src/pages/EventDetailPage" "src/pages/events/" 2>/dev/null || true
  [ -f "src/pages/EventEditPage" ] && mv "src/pages/EventEditPage" "src/pages/events/" 2>/dev/null || true
  
  [ -f "src/pages/GroupsPage" ] && mv "src/pages/GroupsPage" "src/pages/groups/" 2>/dev/null || true
  [ -f "src/pages/GroupDetailPage" ] && mv "src/pages/GroupDetailPage" "src/pages/groups/" 2>/dev/null || true
  [ -f "src/pages/GroupEditPage" ] && mv "src/pages/GroupEditPage" "src/pages/groups/" 2>/dev/null || true
  
  [ -f "src/pages/MarketplacePage" ] && mv "src/pages/MarketplacePage" "src/pages/marketplace/" 2>/dev/null || true
  [ -f "src/pages/MarketplaceDetailPage" ] && mv "src/pages/MarketplaceDetailPage" "src/pages/marketplace/" 2>/dev/null || true
  [ -f "src/pages/MarketplaceEditPage" ] && mv "src/pages/MarketplaceEditPage" "src/pages/marketplace/" 2>/dev/null || true
  
  [ -f "src/pages/NewsPage" ] && mv "src/pages/NewsPage" "src/pages/news/" 2>/dev/null || true
  [ -f "src/pages/NewsDetailPage" ] && mv "src/pages/NewsDetailPage" "src/pages/news/" 2>/dev/null || true
  [ -f "src/pages/NewsEditPage" ] && mv "src/pages/NewsEditPage" "src/pages/news/" 2>/dev/null || true
  [ -f "src/pages/NewsArticleEditPage" ] && mv "src/pages/NewsArticleEditPage" "src/pages/news/" 2>/dev/null || true
  
  [ -f "src/pages/OpportunitiesPage" ] && mv "src/pages/OpportunitiesPage" "src/pages/opportunities/" 2>/dev/null || true
  [ -f "src/pages/OpportunityDetailPage" ] && mv "src/pages/OpportunityDetailPage" "src/pages/opportunities/" 2>/dev/null || true
  [ -f "src/pages/OpportunityEditPage" ] && mv "src/pages/OpportunityEditPage" "src/pages/opportunities/" 2>/dev/null || true
  
  [ -f "src/pages/ResourcesPage" ] && mv "src/pages/ResourcesPage" "src/pages/resources/" 2>/dev/null || true
  [ -f "src/pages/ResourceDetailPage" ] && mv "src/pages/ResourceDetailPage" "src/pages/resources/" 2>/dev/null || true
  [ -f "src/pages/ResourceEditPage" ] && mv "src/pages/ResourceEditPage" "src/pages/resources/" 2>/dev/null || true
  
  echo "✓ Pages reorganized"
}

# Function to move Redux store configuration
setup_store() {
  echo "Setting up store directory..."
  
  mkdir -p src/store
  
  [ -f "src/redux/store.ts" ] && cp "src/redux/store.ts" "src/store/index.ts" 2>/dev/null || true
  [ -f "src/redux/hooks.ts" ] && cp "src/redux/hooks.ts" "src/store/hooks.ts" 2>/dev/null || true
  
  echo "✓ Store directory setup"
}

# Function to organize tests
organize_tests() {
  echo "Organizing test directory..."
  
  # Move integration tests
  mkdir -p src/tests/integration
  [ -f "src/tests/apiIntegrations.test.tsx" ] && mv "src/tests/apiIntegrations.test.tsx" "src/tests/integration/" 2>/dev/null || true
  [ -f "src/tests/directoryProfileManagement.test.tsx" ] && mv "src/tests/directoryProfileManagement.test.tsx" "src/tests/integration/" 2>/dev/null || true
  
  # Move feature tests to their respective features
  [ -d "src/tests/company-employee" ] && cp -r "src/tests/company-employee" "src/features/companies/__tests__/" 2>/dev/null || true
  [ -d "src/tests/marketplace" ] && cp -r "src/tests/marketplace" "src/features/marketplace/__tests__/" 2>/dev/null || true
  
  echo "✓ Tests organized"
}

# Main execution
main() {
  echo "This will continue the migration process."
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Migrate remaining features
    features=(companies directory events groups news opportunities resources)
    for feature in "${features[@]}"; do
      migrate_feature "$feature"
    done
    
    # Continue with shared components
    migrate_more_shared
    
    # Reorganize pages
    reorganize_pages
    
    # Setup store
    setup_store
    
    # Organize tests
    organize_tests
    
    echo ""
    echo "✅ Migration continued successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes"
    echo "2. Update imports using the import migration guide"
    echo "3. Run tests"
    echo "4. Remove old files once imports are updated"
  else
    echo "Migration continuation cancelled."
  fi
}

# Run main function
main