#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define import mappings
const importMappings = [
  // Auth feature
  { from: /from ['"]@\/hooks\/useAuth['"]/, to: "from '@/features/auth/hooks/useAuth'" },
  { from: /from ['"]@\/components\/auth\//, to: "from '@/features/auth/components/" },
  { from: /from ['"]@\/redux\/slices\/authSlice['"]/, to: "from '@/features/auth/store/authSlice'" },
  { from: /from ['"]\.\.\/\.\.\/hooks\/useAuth['"]/, to: "from '@/features/auth/hooks/useAuth'" },
  { from: /from ['"]\.\.\/\.\.\/components\/auth\//, to: "from '@/features/auth/components/" },
  
  // Companies feature
  { from: /from ['"]@\/components\/CompaniesList['"]/, to: "from '@/features/companies/components/CompaniesList'" },
  { from: /from ['"]@\/components\/CompanyProfile['"]/, to: "from '@/features/companies/components/CompanyProfile'" },
  { from: /from ['"]@\/api\/companiesApi['"]/, to: "from '@/features/companies/api/companiesApi'" },
  { from: /from ['"]@\/hooks\/useCompaniesRedux['"]/, to: "from '@/features/companies/hooks/useCompaniesRedux'" },
  { from: /from ['"]@\/hooks\/useCompanyQueries['"]/, to: "from '@/features/companies/hooks/useCompanyQueries'" },
  { from: /from ['"]@\/redux\/slices\/companiesSlice['"]/, to: "from '@/features/companies/store/companiesSlice'" },
  
  // Directory/Members feature
  { from: /from ['"]@\/components\/DirectoryList['"]/, to: "from '@/features/directory/components/DirectoryList'" },
  { from: /from ['"]@\/components\/MembersList['"]/, to: "from '@/features/directory/components/MembersList'" },
  { from: /from ['"]@\/components\/MemberProfile['"]/, to: "from '@/features/directory/components/MemberProfile'" },
  { from: /from ['"]@\/api\/membersApi['"]/, to: "from '@/features/directory/api/membersApi'" },
  { from: /from ['"]@\/redux\/slices\/membersSlice['"]/, to: "from '@/features/directory/store/membersSlice'" },
  
  // Events feature
  { from: /from ['"]@\/components\/EventsList['"]/, to: "from '@/features/events/components/EventsList'" },
  { from: /from ['"]@\/components\/EventsCalendar['"]/, to: "from '@/features/events/components/EventsCalendar'" },
  { from: /from ['"]@\/api\/eventsApi['"]/, to: "from '@/features/events/api/eventsApi'" },
  { from: /from ['"]@\/redux\/slices\/eventsSlice['"]/, to: "from '@/features/events/store/eventsSlice'" },
  
  // Groups feature
  { from: /from ['"]@\/components\/GroupsList['"]/, to: "from '@/features/groups/components/GroupsList'" },
  { from: /from ['"]@\/components\/GroupDetails['"]/, to: "from '@/features/groups/components/GroupDetails'" },
  { from: /from ['"]@\/components\/JoinModal['"]/, to: "from '@/features/groups/components/JoinModal'" },
  { from: /from ['"]@\/api\/groupsApi['"]/, to: "from '@/features/groups/api/groupsApi'" },
  { from: /from ['"]@\/redux\/slices\/groupsSlice['"]/, to: "from '@/features/groups/store/groupsSlice'" },
  
  // Marketplace feature
  { from: /from ['"]@\/components\/MarketplaceList['"]/, to: "from '@/features/marketplace/components/MarketplaceList'" },
  { from: /from ['"]@\/components\/MarketplaceItemDetail['"]/, to: "from '@/features/marketplace/components/MarketplaceItemDetail'" },
  { from: /from ['"]@\/api\/marketplaceApi['"]/, to: "from '@/features/marketplace/api/marketplaceApi'" },
  { from: /from ['"]@\/hooks\/useMarketplaceQueries['"]/, to: "from '@/features/marketplace/hooks/useMarketplaceQueries'" },
  { from: /from ['"]@\/hooks\/useMarketplaceRedux['"]/, to: "from '@/features/marketplace/hooks/useMarketplaceRedux'" },
  { from: /from ['"]@\/redux\/slices\/marketplaceSlice['"]/, to: "from '@/features/marketplace/store/marketplaceSlice'" },
  
  // News feature
  { from: /from ['"]@\/components\/NewsList['"]/, to: "from '@/features/news/components/NewsList'" },
  { from: /from ['"]@\/components\/NewsDetail['"]/, to: "from '@/features/news/components/NewsDetail'" },
  { from: /from ['"]@\/components\/NewsArticlesList['"]/, to: "from '@/features/news/components/NewsArticlesList'" },
  { from: /from ['"]@\/api\/newsApi['"]/, to: "from '@/features/news/api/newsApi'" },
  { from: /from ['"]@\/redux\/slices\/newsSlice['"]/, to: "from '@/features/news/store/newsSlice'" },
  
  // Opportunities feature
  { from: /from ['"]@\/components\/OpportunitiesList['"]/, to: "from '@/features/opportunities/components/OpportunitiesList'" },
  { from: /from ['"]@\/api\/opportunitiesApi['"]/, to: "from '@/features/opportunities/api/opportunitiesApi'" },
  { from: /from ['"]@\/redux\/slices\/opportunitiesSlice['"]/, to: "from '@/features/opportunities/store/opportunitiesSlice'" },
  
  // Resources feature
  { from: /from ['"]@\/components\/ResourcesList['"]/, to: "from '@/features/resources/components/ResourcesList'" },
  { from: /from ['"]@\/components\/ResourcesPreview['"]/, to: "from '@/features/resources/components/ResourcesPreview'" },
  { from: /from ['"]@\/api\/resourcesApi['"]/, to: "from '@/features/resources/api/resourcesApi'" },
  { from: /from ['"]@\/hooks\/useResourcesRedux['"]/, to: "from '@/features/resources/hooks/useResourcesRedux'" },
  { from: /from ['"]@\/redux\/slices\/resourcesSlice['"]/, to: "from '@/features/resources/store/resourcesSlice'" },
  
  // Shared components
  { from: /from ['"]@\/components\/ui\//, to: "from '@/shared/components/ui/" },
  { from: /from ['"]@\/components\/Header['"]/, to: "from '@/shared/components/layout/Header'" },
  { from: /from ['"]@\/components\/Footer['"]/, to: "from '@/shared/components/layout/Footer'" },
  { from: /from ['"]@\/components\/HeroSection['"]/, to: "from '@/shared/components/layout/HeroSection'" },
  { from: /from ['"]@\/components\/ContactSection['"]/, to: "from '@/shared/components/layout/ContactSection'" },
  { from: /from ['"]@\/components\/AboutSection['"]/, to: "from '@/shared/components/layout/AboutSection'" },
  { from: /from ['"]@\/components\/Pagination['"]/, to: "from '@/shared/components/ui/Pagination'" },
  { from: /from ['"]@\/components\/DataSourceIndicator['"]/, to: "from '@/shared/components/ui/DataSourceIndicator'" },
  { from: /from ['"]@\/components\/CustomSelect['"]/, to: "from '@/shared/components/ui/CustomSelect'" },
  { from: /from ['"]@\/components\/RichTextEditor['"]/, to: "from '@/shared/components/ui/RichTextEditor'" },
  { from: /from ['"]@\/components\/ContentEditor['"]/, to: "from '@/shared/components/ContentEditor'" },
  
  // Contexts
  { from: /from ['"]@\/contexts\//, to: "from '@/shared/contexts/" },
  { from: /from ['"]@\/context\//, to: "from '@/shared/contexts/" },
  
  // Utils
  { from: /from ['"]@\/utils\//, to: "from '@/shared/utils/" },
  
  // Lib
  { from: /from ['"]@\/lib\/supabase['"]/, to: "from '@/shared/lib/supabase'" },
  { from: /from ['"]@\/lib\/supabaseClient['"]/, to: "from '@/shared/lib/supabaseClient'" },
  
  // Store
  { from: /from ['"]@\/redux\/store['"]/, to: "from '@/store'" },
  { from: /from ['"]@\/redux\/hooks['"]/, to: "from '@/store/hooks'" },
  
  // Types
  { from: /from ['"]@\/types\/common['"]/, to: "from '@/shared/types/common'" },
  { from: /from ['"]@\/types\/content['"]/, to: "from '@/shared/types/content'" },
  { from: /from ['"]@\/types\/supabase['"]/, to: "from '@/shared/types/supabase'" },
  { from: /from ['"]@\/types\/marketplace['"]/, to: "from '@/features/marketplace/types/marketplace'" },
  
  // Page imports
  { from: /from ['"]@\/pages\/SignInPage['"]/, to: "from '@/pages/auth/SignInPage'" },
  { from: /from ['"]@\/pages\/SignUpPage['"]/, to: "from '@/pages/auth/SignUpPage'" },
  { from: /from ['"]@\/pages\/ResetPasswordPage['"]/, to: "from '@/pages/auth/ResetPasswordPage'" },
  
  // Relative imports (for files that moved)
  { from: /from ['"]\.\.\/\.\.\/lib\/supabase['"]/, to: "from '@/shared/lib/supabase'" },
  { from: /from ['"]\.\.\/\.\.\/contexts\//, to: "from '@/shared/contexts/" },
  { from: /from ['"]\.\.\/\.\.\/utils\//, to: "from '@/shared/utils/" },
];

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    importMappings.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(new RegExp(from, 'g'), to);
        updated = true;
      }
    });
    
    // Also update relative imports for moved files
    if (filePath.includes('src/features/')) {
      // Update relative imports that go up multiple levels
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/lib\/supabase['"]/g, "from '@/shared/lib/supabase'");
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '@/shared/contexts/");
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/utils\//g, "from '@/shared/utils/");
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/types\//g, "from '@/shared/types/");
    }
    
    if (updated || filePath.includes('src/features/')) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}: ${error.message}`);
  }
}

// Main execution
console.log('Updating imports in TypeScript/JavaScript files...\n');

// Find all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

console.log(`Found ${files.length} files to process\n`);

// Update imports in all files
files.forEach(updateImportsInFile);

console.log('\n✅ Import update complete!');
console.log('\nNext steps:');
console.log('1. Run TypeScript compiler to check for errors: npx tsc --noEmit');
console.log('2. Run tests: npm test');
console.log('3. Fix any remaining import issues manually');