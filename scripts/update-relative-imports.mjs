#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

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

// Function to convert relative import to absolute based on file location and target
function convertToAbsoluteImport(filePath, importPath) {
  // If already an absolute import, return as is
  if (!importPath.startsWith('.')) return importPath;
  
  const fileDir = path.dirname(filePath);
  const absolutePath = path.resolve(fileDir, importPath);
  const srcIndex = absolutePath.indexOf('/src/');
  
  if (srcIndex === -1) return importPath;
  
  // Get path relative to src
  let relativePath = absolutePath.substring(srcIndex + 5);
  
  // Map old paths to new paths
  const pathMappings = {
    // Auth
    'components/auth/': 'features/auth/components/',
    'hooks/useAuth': 'features/auth/hooks/useAuth',
    'redux/slices/authSlice': 'features/auth/store/authSlice',
    
    // Companies
    'components/CompaniesList': 'features/companies/components/CompaniesList',
    'components/CompanyProfile': 'features/companies/components/CompanyProfile',
    'api/companiesApi': 'features/companies/api/companiesApi',
    'hooks/useCompaniesRedux': 'features/companies/hooks/useCompaniesRedux',
    'hooks/useCompanyQueries': 'features/companies/hooks/useCompanyQueries',
    'redux/slices/companiesSlice': 'features/companies/store/companiesSlice',
    
    // Directory
    'components/DirectoryList': 'features/directory/components/DirectoryList',
    'components/MembersList': 'features/directory/components/MembersList',
    'components/MemberProfile': 'features/directory/components/MemberProfile',
    'api/membersApi': 'features/directory/api/membersApi',
    'hooks/useMemberQueries': 'features/directory/hooks/useMemberQueries',
    'redux/slices/membersSlice': 'features/directory/store/membersSlice',
    
    // Events
    'components/EventsList': 'features/events/components/EventsList',
    'components/EventsCalendar': 'features/events/components/EventsCalendar',
    'api/eventsApi': 'features/events/api/eventsApi',
    'hooks/useEventQueries': 'features/events/hooks/useEventQueries',
    'hooks/useEventsRedux': 'features/events/hooks/useEventsRedux',
    'redux/slices/eventsSlice': 'features/events/store/eventsSlice',
    
    // Groups
    'components/GroupsList': 'features/groups/components/GroupsList',
    'components/GroupDetails': 'features/groups/components/GroupDetails',
    'components/JoinModal': 'features/groups/components/JoinModal',
    'api/groupsApi': 'features/groups/api/groupsApi',
    'hooks/useGroupQueries': 'features/groups/hooks/useGroupQueries',
    'redux/slices/groupsSlice': 'features/groups/store/groupsSlice',
    
    // Marketplace
    'components/MarketplaceList': 'features/marketplace/components/MarketplaceList',
    'components/MarketplaceItemDetail': 'features/marketplace/components/MarketplaceItemDetail',
    'api/marketplaceApi': 'features/marketplace/api/marketplaceApi',
    'hooks/useMarketplaceQueries': 'features/marketplace/hooks/useMarketplaceQueries',
    'hooks/useMarketplaceRedux': 'features/marketplace/hooks/useMarketplaceRedux',
    'redux/slices/marketplaceSlice': 'features/marketplace/store/marketplaceSlice',
    
    // News
    'components/NewsList': 'features/news/components/NewsList',
    'components/NewsDetail': 'features/news/components/NewsDetail',
    'components/NewsArticlesList': 'features/news/components/NewsArticlesList',
    'api/newsApi': 'features/news/api/newsApi',
    'hooks/useNewsQueries': 'features/news/hooks/useNewsQueries',
    'redux/slices/newsSlice': 'features/news/store/newsSlice',
    
    // Opportunities
    'components/OpportunitiesList': 'features/opportunities/components/OpportunitiesList',
    'api/opportunitiesApi': 'features/opportunities/api/opportunitiesApi',
    'redux/slices/opportunitiesSlice': 'features/opportunities/store/opportunitiesSlice',
    
    // Resources
    'components/ResourcesList': 'features/resources/components/ResourcesList',
    'components/ResourcesPreview': 'features/resources/components/ResourcesPreview',
    'api/resourcesApi': 'features/resources/api/resourcesApi',
    'hooks/useResourcesRedux': 'features/resources/hooks/useResourcesRedux',
    'redux/slices/resourcesSlice': 'features/resources/store/resourcesSlice',
    
    // Shared UI
    'components/ui/': 'shared/components/ui/',
    'components/Header': 'shared/components/layout/Header',
    'components/Footer': 'shared/components/layout/Footer',
    'components/HeroSection': 'shared/components/layout/HeroSection',
    'components/ContactSection': 'shared/components/layout/ContactSection',
    'components/AboutSection': 'shared/components/layout/AboutSection',
    'components/Pagination': 'shared/components/ui/Pagination',
    'components/DataSourceIndicator': 'shared/components/ui/DataSourceIndicator',
    'components/CustomSelect': 'shared/components/ui/CustomSelect',
    'components/RichTextEditor': 'shared/components/ui/RichTextEditor',
    'components/ContentEditor': 'shared/components/ContentEditor',
    
    // Contexts
    'contexts/': 'shared/contexts/',
    'context/': 'shared/contexts/',
    
    // Utils
    'utils/': 'shared/utils/',
    
    // Lib
    'lib/supabase': 'shared/lib/supabase',
    'lib/supabaseClient': 'shared/lib/supabaseClient',
    
    // Store
    'redux/store': 'store/index',
    'redux/hooks': 'store/hooks',
  };
  
  // Check if path needs mapping
  for (const [oldPath, newPath] of Object.entries(pathMappings)) {
    if (relativePath.startsWith(oldPath)) {
      return '@/' + relativePath.replace(oldPath, newPath);
    }
  }
  
  // Return original if no mapping found
  return importPath;
}

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Match import statements with relative paths
    const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
    
    content = content.replace(importRegex, (match, importPath) => {
      const newPath = convertToAbsoluteImport(filePath, importPath);
      if (newPath !== importPath) {
        updated = true;
        return `from '${newPath}'`;
      }
      return match;
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error: ${filePath} - ${error.message}`);
    return false;
  }
}

// Main execution
console.log('Updating relative imports to absolute imports...\n');

const projectRoot = path.resolve(__dirname, '..');
const srcPath = path.join(projectRoot, 'src');
const files = getAllFiles(srcPath);
console.log(`Found ${files.length} files to check\n`);

let updatedCount = 0;
files.forEach(file => {
  if (updateImportsInFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✅ Complete! Updated ${updatedCount} files`);
console.log('\nNext steps:');
console.log('1. Run TypeScript compiler: npx tsc --noEmit');
console.log('2. Run tests: npm test');
console.log('3. Remove old directories once everything works');