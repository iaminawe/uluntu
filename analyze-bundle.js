import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to calculate directory size
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        walkDir(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  if (fs.existsSync(dirPath)) {
    walkDir(dirPath);
  }
  
  return totalSize;
}

// Function to analyze node_modules
function analyzeNodeModules() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const packages = {};
  
  if (fs.existsSync(nodeModulesPath)) {
    const dirs = fs.readdirSync(nodeModulesPath);
    
    for (const dir of dirs) {
      if (dir.startsWith('.')) continue;
      
      const packagePath = path.join(nodeModulesPath, dir);
      if (fs.statSync(packagePath).isDirectory()) {
        const size = getDirectorySize(packagePath);
        if (size > 1024 * 1024) { // Only show packages > 1MB
          packages[dir] = size;
        }
      }
    }
  }
  
  return packages;
}

// Function to analyze source code
function analyzeSourceCode() {
  const srcPath = path.join(__dirname, 'src');
  const features = {};
  
  if (fs.existsSync(srcPath)) {
    const featurePath = path.join(srcPath, 'features');
    if (fs.existsSync(featurePath)) {
      const featureDirs = fs.readdirSync(featurePath);
      
      for (const feature of featureDirs) {
        const featureFullPath = path.join(featurePath, feature);
        if (fs.statSync(featureFullPath).isDirectory()) {
          features[feature] = getDirectorySize(featureFullPath);
        }
      }
    }
  }
  
  return features;
}

console.log('=== Bundle Size Analysis ===\n');

// Analyze node_modules
console.log('Top Dependencies by Size:');
const packages = analyzeNodeModules();
const sortedPackages = Object.entries(packages)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 20);

for (const [name, size] of sortedPackages) {
  console.log(`  ${name}: ${(size / 1024 / 1024).toFixed(2)} MB`);
}

console.log('\n');

// Analyze source code
console.log('Feature Sizes:');
const features = analyzeSourceCode();
const sortedFeatures = Object.entries(features)
  .sort(([, a], [, b]) => b - a);

for (const [name, size] of sortedFeatures) {
  console.log(`  ${name}: ${(size / 1024).toFixed(2)} KB`);
}

// Total sizes
const totalNodeModules = Object.values(packages).reduce((sum, size) => sum + size, 0);
const totalSrc = getDirectorySize(path.join(__dirname, 'src'));

console.log('\n');
console.log('Summary:');
console.log(`  Total node_modules: ${(totalNodeModules / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Total source code: ${(totalSrc / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Estimated bundle size: ${((totalNodeModules + totalSrc) / 1024 / 1024 / 4).toFixed(2)} MB (rough estimate)`);