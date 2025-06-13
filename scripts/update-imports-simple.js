#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  
  // Marketplace feature
  { from: /from ['"]@\/components\/MarketplaceList['"]/, to: "from '@/features/marketplace/components/MarketplaceList'" },
  { from: /from ['"]@\/api\/marketplaceApi['"]/, to: "from '@/features/marketplace/api/marketplaceApi'" },
  { from: /from ['"]@\/redux\/slices\/marketplaceSlice['"]/, to: "from '@/features/marketplace/store/marketplaceSlice'" },
  
  // Shared components
  { from: /from ['"]@\/components\/ui\//, to: "from '@/shared/components/ui/" },
  { from: /from ['"]@\/components\/Header['"]/, to: "from '@/shared/components/layout/Header'" },
  { from: /from ['"]@\/components\/Footer['"]/, to: "from '@/shared/components/layout/Footer'" },
  { from: /from ['"]@\/contexts\//, to: "from '@/shared/contexts/" },
  { from: /from ['"]@\/utils\//, to: "from '@/shared/utils/" },
  { from: /from ['"]@\/lib\/supabase['"]/, to: "from '@/shared/lib/supabase'" },
  
  // Store
  { from: /from ['"]@\/redux\/store['"]/, to: "from '@/store'" },
  { from: /from ['"]@\/redux\/hooks['"]/, to: "from '@/store/hooks'" },
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

const files = getAllFiles('./src');
console.log(`Found ${files.length} files\n`);

files.forEach(updateImportsInFile);

console.log('\n✅ Complete!');