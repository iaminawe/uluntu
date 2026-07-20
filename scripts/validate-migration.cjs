#!/usr/bin/env node

/**
 * Simple validation script for SQL migration files
 * Validates JSON syntax within dollar-quoted strings
 */

const fs = require('fs');
const path = require('path');

const migrationFile = process.argv[2] || 'supabase/migrations/20251111130000_create_about_pages_puck.sql';
const fullPath = path.join(process.cwd(), migrationFile);

console.log('Validating migration file:', fullPath);

try {
  const content = fs.readFileSync(fullPath, 'utf8');

  // Extract JSON blocks between $$ delimiters
  const jsonBlocks = [];
  const regex = /\$\$([\s\S]*?)\$\$/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    jsonBlocks.push({
      content: match[1],
      index: match.index
    });
  }

  console.log(`Found ${jsonBlocks.length} JSON blocks to validate\n`);

  let allValid = true;

  jsonBlocks.forEach((block, idx) => {
    try {
      const parsed = JSON.parse(block.content);
      console.log(`✓ Block ${idx + 1}: Valid JSON`);

      // Validate Puck data structure
      if (parsed.content && Array.isArray(parsed.content)) {
        console.log(`  - Contains ${parsed.content.length} components`);
        const componentTypes = parsed.content.map(c => c.type).join(', ');
        console.log(`  - Components: ${componentTypes}`);
      }

      if (parsed.root) {
        console.log(`  - Has root configuration`);
      }

      console.log('');
    } catch (err) {
      allValid = false;
      console.error(`✗ Block ${idx + 1}: Invalid JSON`);
      console.error(`  Error: ${err.message}`);
      console.error(`  Position: Line ${content.substring(0, block.index).split('\n').length}`);
      console.error('');
    }
  });

  // Check for common SQL issues
  console.log('\nChecking for common SQL issues...');

  const issues = [];

  // Check for unescaped quotes within JSON (excluding dollar-quoted sections)
  const outsideDollarQuotes = content.replace(/\$\$[\s\S]*?\$\$/g, '');
  if (outsideDollarQuotes.match(/'\s*{/)) {
    issues.push('Found JSON starting with single quote instead of dollar quote');
  }

  // Check for proper ON CONFLICT syntax
  if (!content.includes('ON CONFLICT (slug) DO UPDATE')) {
    issues.push('Missing proper ON CONFLICT clause');
  }

  if (issues.length > 0) {
    console.log('\n⚠️  Potential issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✓ No common SQL issues detected');
  }

  if (allValid && issues.length === 0) {
    console.log('\n✅ Migration file appears valid!');
    process.exit(0);
  } else {
    console.log('\n❌ Migration file has issues that need to be fixed');
    process.exit(1);
  }

} catch (err) {
  console.error('Error reading migration file:', err.message);
  process.exit(1);
}
