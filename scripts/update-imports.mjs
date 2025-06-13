#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (fullPath.match(/\.(ts|tsx|js|jsx)$/)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

// Define import mappings
const importMappings = [
  // Auth feature
  { from: /from ['"]@\/hooks\/useAuth['"]/, to: "from '@/features/auth/hooks/useAuth'" },
  { from: /from ['"]@\/components\/auth\//, to: "from '@/features/auth/components/" },
  { from: /from ['"]@\/redux\/slices\/authSlice['"]/, to: "from '@/features/auth/store/authSlice'" },
  
  // Companies feature
  { from: /from ['"]@\/components\/CompaniesList['"]/, to: "from '@/features/companies/components/CompaniesList'" },
  { from: /from ['"]@\/api\/companiesApi['"]/, to: "from '@/features/companies/api/companiesApi'" },
  { from: /from ['"]@\/redux\/slices\/companiesSlice['"]/, to: "from '@/features/companies/store/companiesSlice'" },
  
  // Directory
  { from: /from ['"]@\/components\/DirectoryList['"]/, to: "from '@/features/directory/components/DirectoryList'" },
  { from: /from ['"]@\/components\/MembersList['"]/, to: "from '@/features/directory/components/MembersList'" },
  { from: /from ['"]@\/api\/membersApi['"]/, to: "from '@/features/directory/api/membersApi'" },
  { from: /from ['"]@\/redux\/slices\/membersSlice['"]/, to: "from '@/features/directory/store/membersSlice'" },
  
  // Events
  { from: /from ['"]@\/components\/EventsList['"]/, to: "from '@/features/events/components/EventsList'" },
  { from: /from ['"]@\/api\/eventsApi['"]/, to: "from '@/features/events/api/eventsApi'" },
  { from: /from ['"]@\/redux\/slices\/eventsSlice['"]/, to: "from '@/features/events/store/eventsSlice'" },
  
  // Groups
  { from: /from ['"]@\/components\/GroupsList['"]/, to: "from '@/features/groups/components/GroupsList'" },
  { from: /from ['"]@\/api\/groupsApi['"]/, to: "from '@/features/groups/api/groupsApi'" },
  { from: /from ['"]@\/redux\/slices\/groupsSlice['"]/, to: "from '@/features/groups/store/groupsSlice'" },
  
  // Marketplace feature
  { from: /from ['"]@\/components\/MarketplaceList['"]/, to: "from '@/features/marketplace/components/MarketplaceList'" },
  { from: /from ['"]@\/components\/MarketplaceItemDetail['"]/, to: "from '@/features/marketplace/components/MarketplaceItemDetail'" },
  { from: /from ['"]@\/api\/marketplaceApi['"]/, to: "from '@/features/marketplace/api/marketplaceApi'" },
  { from: /from ['"]@\/hooks\/useMarketplaceQueries['"]/, to: "from '@/features/marketplace/hooks/useMarketplaceQueries'" },
  { from: /from ['"]@\/redux\/slices\/marketplaceSlice['"]/, to: "from '@/features/marketplace/store/marketplaceSlice'" },
  
  // News
  { from: /from ['"]@\/components\/NewsList['"]/, to: "from '@/features/news/components/NewsList'" },
  { from: /from ['"]@\/components\/NewsArticlesList['"]/, to: "from '@/features/news/components/NewsArticlesList'" },
  { from: /from ['"]@\/api\/newsApi['"]/, to: "from '@/features/news/api/newsApi'" },
  { from: /from ['"]@\/redux\/slices\/newsSlice['"]/, to: "from '@/features/news/store/newsSlice'" },
  
  // Opportunities
  { from: /from ['"]@\/components\/OpportunitiesList['"]/, to: "from '@/features/opportunities/components/OpportunitiesList'" },
  { from: /from ['"]@\/api\/opportunitiesApi['"]/, to: "from '@/features/opportunities/api/opportunitiesApi'" },
  { from: /from ['"]@\/redux\/slices\/opportunitiesSlice['"]/, to: "from '@/features/opportunities/store/opportunitiesSlice'" },
  
  // Resources
  { from: /from ['"]@\/components\/ResourcesList['"]/, to: "from '@/features/resources/components/ResourcesList'" },
  { from: /from ['"]@\/api\/resourcesApi['"]/, to: "from '@/features/resources/api/resourcesApi'" },
  { from: /from ['"]@\/redux\/slices\/resourcesSlice['"]/, to: "from '@/features/resources/store/resourcesSlice'" },
  
  // Shared components
  { from: /from ['"]@\/components\/ui\//, to: "from '@/shared/components/ui/" },
  { from: /from ['"]@\/components\/Header['"]/, to: "from '@/shared/components/layout/Header'" },
  { from: /from ['"]@\/components\/Footer['"]/, to: "from '@/shared/components/layout/Footer'" },
  { from: /from ['"]@\/components\/Pagination['"]/, to: "from '@/shared/components/ui/Pagination'" },
  { from: /from ['"]@\/components\/CustomSelect['"]/, to: "from '@/shared/components/ui/CustomSelect'" },
  { from: /from ['"]@\/contexts\//, to: "from '@/shared/contexts/" },
  { from: /from ['"]@\/utils\//, to: "from '@/shared/utils/" },
  { from: /from ['"]@\/lib\/supabase['"]/, to: "from '@/shared/lib/supabase'" },
  { from: /from ['"]@\/lib\/supabaseClient['"]/, to: "from '@/shared/lib/supabaseClient'" },
  
  // Store
  { from: /from ['"]@\/redux\/store['"]/, to: "from '@/store'" },
  { from: /from ['"]@\/redux\/hooks['"]/, to: "from '@/store/hooks'" },
  
  // Page imports
  { from: /from ['"]@\/pages\/SignInPage['"]/, to: "from '@/pages/auth/SignInPage'" },
  { from: /from ['"]@\/pages\/SignUpPage['"]/, to: "from '@/pages/auth/SignUpPage'" },
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
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error: ${filePath} - ${error.message}`);
  }
}

// Main execution
console.log('Updating imports...\n');

const projectRoot = path.resolve(__dirname, '..');
const srcPath = path.join(projectRoot, 'src');
const files = getAllFiles(srcPath);
console.log(`Found ${files.length} files\n`);

let updatedCount = 0;
files.forEach(file => {
  const before = fs.readFileSync(file, 'utf8');
  updateImportsInFile(file);
  const after = fs.readFileSync(file, 'utf8');
  if (before !== after) updatedCount++;
});

console.log(`\n✅ Complete! Updated ${updatedCount} files`);