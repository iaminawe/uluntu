#!/bin/bash

# Code Reorganization Script for Nelson Tech
# This script helps automate the file movements for the code reorganization

set -e

echo "Nelson Tech Code Reorganization Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the project root directory"
  exit 1
fi

# Function to create directories
create_directories() {
  echo "Creating new directory structure..."
  
  # Create feature directories
  features=(auth companies directory events groups marketplace news opportunities resources)
  for feature in "${features[@]}"; do
    mkdir -p "src/features/$feature"/{components,hooks,api,store,types,utils,__tests__}
  done
  
  # Create shared directories
  mkdir -p src/shared/{components/{ui,layout,forms},contexts,hooks,types,utils}
  
  # Create test directories
  mkdir -p src/tests/{integration,e2e,fixtures}
  
  # Create store directory
  mkdir -p src/store
  
  echo "✓ Directory structure created"
}

# Function to remove legacy code
remove_legacy() {
  echo "Removing legacy and duplicate code..."
  
  # Remove auth_template if it exists
  if [ -d "src/auth_template" ]; then
    echo "  Removing src/auth_template..."
    rm -rf src/auth_template
  fi
  
  # Remove debug components
  debug_files=(
    "src/pages/MarketplaceDebugDetailPage.tsx"
    "src/pages/MarketplaceDetailPage/DetailDebug.tsx"
    "src/pages/MarketplacePage/Debug.tsx"
  )
  
  for file in "${debug_files[@]}"; do
    if [ -f "$file" ]; then
      echo "  Removing $file..."
      rm -f "$file"
    fi
  done
  
  # Remove duplicate hooks
  if [ -f "src/hooks/useMarketplaceQueries.ts" ] && [ -f "src/hooks/useMarketplaceQueriesFixed.ts" ]; then
    echo "  Removing duplicate hook..."
    rm -f "src/hooks/useMarketplaceQueries.ts"
    mv "src/hooks/useMarketplaceQueriesFixed.ts" "src/hooks/useMarketplaceQueries.ts" 2>/dev/null || true
  fi
  
  # Remove .js test files if .tsx versions exist
  find src -name "*.test.js" | while read jsfile; do
    tsxfile="${jsfile%.js}.tsx"
    if [ -f "$tsxfile" ]; then
      echo "  Removing duplicate test: $jsfile"
      rm -f "$jsfile"
    fi
  done
  
  echo "✓ Legacy code removed"
}

# Function to consolidate directories
consolidate_directories() {
  echo "Consolidating directories..."
  
  # Merge context into contexts
  if [ -d "src/context" ] && [ -d "src/contexts" ]; then
    echo "  Merging context/ into contexts/..."
    cp -r src/context/* src/contexts/ 2>/dev/null || true
    rm -rf src/context
  fi
  
  # Remove router in favor of routes
  if [ -d "src/router" ] && [ -d "src/routes" ]; then
    echo "  Consolidating routing..."
    # Copy any unique files from router to routes
    cp -n src/router/* src/routes/ 2>/dev/null || true
    rm -rf src/router
  fi
  
  echo "✓ Directories consolidated"
}

# Function to migrate auth feature
migrate_auth() {
  echo "Migrating Auth feature..."
  
  # Move auth components
  if [ -d "src/components/auth" ]; then
    cp -r src/components/auth/* src/features/auth/components/ 2>/dev/null || true
  fi
  
  # Move auth hooks
  if [ -f "src/hooks/useAuth.ts" ]; then
    cp src/hooks/useAuth.ts src/features/auth/hooks/
  fi
  
  # Move auth slice
  if [ -f "src/redux/slices/authSlice.ts" ]; then
    cp src/redux/slices/authSlice.ts src/features/auth/store/
  fi
  
  # Move auth pages to pages/auth
  mkdir -p src/pages/auth
  for page in SignInPage SignUpPage ResetPasswordPage UnauthorizedPage; do
    if [ -f "src/pages/${page}.tsx" ]; then
      mv "src/pages/${page}.tsx" "src/pages/auth/"
    fi
  done
  
  echo "✓ Auth feature migrated"
}

# Function to migrate marketplace feature
migrate_marketplace() {
  echo "Migrating Marketplace feature..."
  
  # Move marketplace components
  for comp in MarketplaceList MarketplaceItemDetail; do
    if [ -d "src/components/$comp" ]; then
      cp -r "src/components/$comp" src/features/marketplace/components/ 2>/dev/null || true
    fi
  done
  
  # Move marketplace API
  if [ -f "src/api/marketplaceApi.ts" ]; then
    cp src/api/marketplaceApi.ts src/features/marketplace/api/
  fi
  
  # Move marketplace hooks
  for hook in src/hooks/useMarketplace*.ts; do
    if [ -f "$hook" ]; then
      cp "$hook" src/features/marketplace/hooks/
    fi
  done
  
  # Move marketplace slice
  if [ -f "src/redux/slices/marketplaceSlice.ts" ]; then
    cp src/redux/slices/marketplaceSlice.ts src/features/marketplace/store/
  fi
  
  # Move marketplace types
  if [ -f "src/types/marketplace.ts" ]; then
    cp src/types/marketplace.ts src/features/marketplace/types/
  fi
  
  echo "✓ Marketplace feature migrated"
}

# Function to migrate shared components
migrate_shared() {
  echo "Migrating shared components..."
  
  # Move UI components
  ui_components=(Button Pagination DataSourceIndicator CustomSelect)
  for comp in "${ui_components[@]}"; do
    if [ -e "src/components/$comp" ]; then
      cp -r "src/components/$comp" src/shared/components/ui/ 2>/dev/null || true
    fi
  done
  
  # Move layout components
  layout_components=(Header Footer HeroSection)
  for comp in "${layout_components[@]}"; do
    if [ -d "src/components/$comp" ]; then
      cp -r "src/components/$comp" src/shared/components/layout/ 2>/dev/null || true
    fi
  done
  
  # Move contexts
  if [ -d "src/contexts" ]; then
    cp -r src/contexts/* src/shared/contexts/ 2>/dev/null || true
  fi
  
  # Move shared hooks
  shared_hooks=(useDebounce useLocalStorage usePagination)
  for hook in "${shared_hooks[@]}"; do
    if [ -f "src/hooks/${hook}.ts" ]; then
      cp "src/hooks/${hook}.ts" src/shared/hooks/
    fi
  done
  
  # Move shared types
  if [ -f "src/types/common.ts" ]; then
    cp src/types/common.ts src/shared/types/
  fi
  
  # Move shared utils
  if [ -d "src/utils" ]; then
    cp -r src/utils/* src/shared/utils/ 2>/dev/null || true
  fi
  
  echo "✓ Shared components migrated"
}

# Function to create barrel exports
create_exports() {
  echo "Creating barrel exports..."
  
  # Create exports for each feature
  features=(auth companies directory events groups marketplace news opportunities resources)
  for feature in "${features[@]}"; do
    cat > "src/features/$feature/index.ts" << EOF
// Export all public APIs from the $feature feature
export * from './components';
export * from './hooks';
export * from './api';
export * from './store';
export * from './types';
EOF
  done
  
  echo "✓ Barrel exports created"
}

# Function to update imports (placeholder - requires more complex tooling)
update_imports() {
  echo "Import updates need to be done manually or with a proper refactoring tool"
  echo "Suggested tools:"
  echo "  - VS Code: Use 'Update imports on file move' setting"
  echo "  - Manual: Search and replace old paths with new paths"
  echo "  - Script: Use a tool like jscodeshift for automated refactoring"
}

# Main execution
main() {
  echo "This script will reorganize the codebase structure."
  echo "It's recommended to run this on a clean git branch."
  echo ""
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create backup branch
    git checkout -b reorganization-backup 2>/dev/null || true
    git checkout -
    
    # Execute migration steps
    create_directories
    remove_legacy
    consolidate_directories
    migrate_auth
    migrate_marketplace
    migrate_shared
    create_exports
    
    echo ""
    echo "✅ Initial reorganization complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes with 'git status'"
    echo "2. Update imports manually or with refactoring tools"
    echo "3. Run tests to ensure everything works"
    echo "4. Continue migrating other features"
    echo "5. Remove old empty directories"
    echo ""
    echo "⚠️  Note: This script copies files to preserve the original structure."
    echo "    Once imports are updated and tests pass, remove the original files."
  else
    echo "Reorganization cancelled."
  fi
}

# Run main function
main