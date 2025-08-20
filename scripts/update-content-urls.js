#!/usr/bin/env node

/**
 * Script to update all content URLs to use slug-based utilities
 * This will update all components to use the new contentUrlUtils functions
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define the updates needed for each content type
const contentTypeUpdates = [
  {
    pattern: /to=\{`\/news\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getNewsArticleUrl($1)}',
    importNeeded: 'getNewsArticleUrl',
    contentType: 'news'
  },
  {
    pattern: /to=\{`\/events\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getEventUrl($1)}',
    importNeeded: 'getEventUrl',
    contentType: 'events'
  },
  {
    pattern: /to=\{`\/opportunities\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getOpportunityUrl($1)}',
    importNeeded: 'getOpportunityUrl',
    contentType: 'opportunities'
  },
  {
    pattern: /to=\{`\/marketplace\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getMarketplaceListingUrl($1)}',
    importNeeded: 'getMarketplaceListingUrl',
    contentType: 'marketplace'
  },
  {
    pattern: /to=\{`\/companies\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getCompanyUrl($1)}',
    importNeeded: 'getCompanyUrl',
    contentType: 'companies'
  },
  {
    pattern: /to=\{`\/resources\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getResourceUrl($1)}',
    importNeeded: 'getResourceUrl',
    contentType: 'resources'
  },
  {
    pattern: /to=\{`\/groups\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getGroupUrl($1)}',
    importNeeded: 'getGroupUrl',
    contentType: 'groups'
  },
  {
    pattern: /to=\{`\/galleries\/\$\{(\w+)\.id\}`\}/g,
    replacement: 'to={getGalleryUrl($1)}',
    importNeeded: 'getGalleryUrl',
    contentType: 'galleries'
  },
  // Special case for group posts
  {
    pattern: /to=\{`\/groups\/\$\{(\w+)\.(?:group\.)?id\}\/posts\/\$\{(\w+)(?:\.id)?\}`\}/g,
    replacement: 'to={getGroupPostUrl($1, $2)}',
    importNeeded: 'getGroupPostUrl',
    contentType: 'group-posts'
  }
];

// Files to skip (already updated or special cases)
const skipFiles = [
  'memberSlugUtils.ts',
  'contentUrlUtils.ts',
  'AuthorLink',
  'MemberCard.tsx' // Already updated
];

function shouldSkipFile(filePath) {
  return skipFiles.some(skip => filePath.includes(skip));
}

function addImportIfNeeded(content, importsNeeded) {
  if (importsNeeded.length === 0) return content;
  
  const importStatement = `import { ${importsNeeded.join(', ')} } from '@/utils/contentUrlUtils';`;
  
  // Check if import already exists
  if (content.includes("from '@/utils/contentUrlUtils'")) {
    // Update existing import
    const existingImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@\/utils\/contentUrlUtils['"]/;
    const match = content.match(existingImportRegex);
    if (match) {
      const existingImports = match[1].split(',').map(s => s.trim());
      const allImports = [...new Set([...existingImports, ...importsNeeded])];
      const newImportStatement = `import { ${allImports.join(', ')} } from '@/utils/contentUrlUtils'`;
      return content.replace(existingImportRegex, newImportStatement);
    }
  }
  
  // Add new import after the last import statement
  const importRegex = /^import\s+.*$/gm;
  const imports = content.match(importRegex);
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    return content.slice(0, lastImportIndex + lastImport.length) + 
           '\n' + importStatement + 
           content.slice(lastImportIndex + lastImport.length);
  }
  
  // If no imports found, add at the beginning
  return importStatement + '\n\n' + content;
}

function updateFile(filePath) {
  if (shouldSkipFile(filePath)) {
    console.log(`Skipping: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let importsNeeded = new Set();
  let changesM made = false;
  
  contentTypeUpdates.forEach(update => {
    if (content.match(update.pattern)) {
      content = content.replace(update.pattern, update.replacement);
      importsNeeded.add(update.importNeeded);
      changesMade = true;
      console.log(`  Updated ${update.contentType} links in ${path.basename(filePath)}`);
    }
  });
  
  if (changesMade) {
    content = addImportIfNeeded(content, Array.from(importsNeeded));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔍 Searching for files to update...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = glob.sync('**/*.{ts,tsx}', { 
    cwd: srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
  });
  
  console.log(`Found ${files.length} TypeScript files\n`);
  
  let updatedCount = 0;
  files.forEach(file => {
    if (updateFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\n✨ Updated ${updatedCount} files with slug-based URLs`);
}

// Run the script
main();