#!/usr/bin/env ts-node

/**
 * Script to systematically replace 'any' types with proper TypeScript types
 * Run with: npx ts-node scripts/fix-any-types.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Common patterns to replace
const patterns = [
  // API function return types
  {
    pattern: /Promise<any\[\]>/g,
    replacement: 'Promise<unknown[]>',
    description: 'Replace Promise<any[]> with Promise<unknown[]>'
  },
  {
    pattern: /Promise<any>/g,
    replacement: 'Promise<unknown>',
    description: 'Replace Promise<any> with Promise<unknown>'
  },
  // Event handlers
  {
    pattern: /\(.*?\)\s*=>\s*any/g,
    replacement: (match: string) => match.replace('any', 'void'),
    description: 'Replace any return type in arrow functions with void'
  },
  // React props and state
  {
    pattern: /React\.ComponentProps<any>/g,
    replacement: 'React.ComponentProps<"div">',
    description: 'Replace React.ComponentProps<any> with specific element'
  },
  // Generic constraints
  {
    pattern: /<T = any>/g,
    replacement: '<T = unknown>',
    description: 'Replace generic default any with unknown'
  },
  // Type assertions
  {
    pattern: /as any(?!\w)/g,
    replacement: 'as unknown',
    description: 'Replace "as any" with "as unknown"'
  }
];

// Files to exclude from processing
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /\.d\.ts$/,
  /\.js$/
];

// Track changes
let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

function shouldExcludeFile(filePath: string): boolean {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

function processFile(filePath: string): void {
  if (shouldExcludeFile(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileModified = false;
    let fileReplacements = 0;

    // Apply each pattern
    patterns.forEach(({ pattern, replacement, description }) => {
      const beforeLength = newContent.length;
      
      if (typeof replacement === 'string') {
        newContent = newContent.replace(pattern, replacement);
      } else {
        newContent = newContent.replace(pattern, replacement);
      }
      
      if (newContent.length !== beforeLength || newContent !== content) {
        const matches = (content.match(pattern) || []).length;
        if (matches > 0) {
          console.log(`  ✓ ${description}: ${matches} replacement(s)`);
          fileReplacements += matches;
          fileModified = true;
        }
      }
    });

    // Write back if modified
    if (fileModified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
      totalReplacements += fileReplacements;
      console.log(`📝 Modified: ${filePath} (${fileReplacements} changes)`);
    }

    totalFiles++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function processDirectory(dirPath: string): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!shouldExcludeFile(fullPath)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      processFile(fullPath);
    }
  }
}

function main() {
  console.log('🔧 Starting automatic any-type replacement...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src directory not found!');
    process.exit(1);
  }

  processDirectory(srcPath);

  console.log('\n📊 Summary:');
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  
  if (modifiedFiles > 0) {
    console.log('\n✅ Type safety improvements applied!');
    console.log('💡 Remember to run "npm run typecheck" to verify changes.');
  } else {
    console.log('\n🎉 No any-types found that could be automatically fixed!');
  }
}

main();