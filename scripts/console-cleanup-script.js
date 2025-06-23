#!/usr/bin/env node
/**
 * Console Cleanup Script for Nelson Tech Platform
 * Helps continue the systematic removal of console statements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get files with most console statements
function getFilesWithMostConsoleStatements() {
  try {
    const command = `rg "console\\.(log|warn|error|info|debug)" src --count --type-add 'web:*.{js,jsx,ts,tsx}' --type web | sort -nr -t: -k2 | head -30`;
    const result = execSync(command, { encoding: 'utf8', cwd: __dirname });
    
    return result.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [filePath, count] = line.split(':');
        return { filePath, count: parseInt(count) };
      });
  } catch (error) {
    console.error('Error running command:', error.message);
    return [];
  }
}

// Analyze console statement types in a file
function analyzeConsoleStatements(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const statements = [];
    lines.forEach((line, index) => {
      const consoleMatch = line.match(/console\.(log|warn|error|info|debug)/g);
      if (consoleMatch) {
        consoleMatch.forEach(match => {
          statements.push({
            lineNumber: index + 1,
            type: match.split('.')[1],
            line: line.trim(),
            isLegitimate: isLegitimateConsoleStatement(line, match.split('.')[1])
          });
        });
      }
    });
    
    return statements;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Determine if a console statement is legitimate (should be kept)
function isLegitimateConsoleStatement(line, type) {
  const lineUpper = line.toUpperCase();
  
  // Keep error statements in catch blocks and error handlers
  if (type === 'error') {
    return lineUpper.includes('CATCH') || 
           lineUpper.includes('ERROR') || 
           lineUpper.includes('THROW') ||
           lineUpper.includes('EXCEPTION');
  }
  
  // Keep warning statements for configuration issues
  if (type === 'warn') {
    return lineUpper.includes('CONFIG') || 
           lineUpper.includes('DEPRECAT') || 
           lineUpper.includes('FALLBACK') ||
           lineUpper.includes('MISSING');
  }
  
  // Remove most log/info/debug statements (these are usually debug)
  return false;
}

// Generate cleanup suggestions
function generateCleanupSuggestions() {
  console.log('🧹 Console Statement Cleanup Progress Report\n');
  
  const files = getFilesWithMostConsoleStatements();
  
  if (files.length === 0) {
    console.log('✅ No files found with console statements!');
    return;
  }
  
  console.log('📊 Files with most console statements:');
  console.log('=====================================');
  
  let totalDebugStatements = 0;
  let totalLegitimateStatements = 0;
  
  files.slice(0, 10).forEach((file, index) => {
    const statements = analyzeConsoleStatements(file.filePath);
    const debugCount = statements.filter(s => !s.isLegitimate).length;
    const legitimateCount = statements.filter(s => s.isLegitimate).length;
    
    totalDebugStatements += debugCount;
    totalLegitimateStatements += legitimateCount;
    
    console.log(`${index + 1}. ${file.filePath}`);
    console.log(`   Total: ${file.count} | Debug: ${debugCount} | Legitimate: ${legitimateCount}`);
    
    if (debugCount > 0) {
      console.log(`   🔧 Priority: ${debugCount > 10 ? 'HIGH' : debugCount > 5 ? 'MEDIUM' : 'LOW'}`);
    }
    console.log('');
  });
  
  console.log('📈 Summary:');
  console.log(`• Files processed: ${Math.min(files.length, 10)}`);
  console.log(`• Debug statements to remove: ${totalDebugStatements}`);
  console.log(`• Legitimate statements to keep: ${totalLegitimateStatements}`);
  
  console.log('\n🎯 Recommended Next Steps:');
  console.log('1. Focus on files with HIGH priority (>10 debug statements)');
  console.log('2. Use logger.debug() for development logging');
  console.log('3. Keep console.error() in catch blocks and error handlers');
  console.log('4. Replace important logging with proper logger utility');
  
  console.log('\n💡 Quick Commands:');
  console.log('• Find debug logs: rg "console\\.log" src');
  console.log('• Find error logs: rg "console\\.error" src');
  console.log('• Count by type: rg "console\\.(\\w+)" src -o | sort | uniq -c');
}

// Main execution
if (require.main === module) {
  generateCleanupSuggestions();
}

module.exports = {
  getFilesWithMostConsoleStatements,
  analyzeConsoleStatements,
  isLegitimateConsoleStatement,
  generateCleanupSuggestions
};