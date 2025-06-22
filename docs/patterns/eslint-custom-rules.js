/**
 * Custom ESLint rules for Nelson Tech Community Platform
 * These rules enforce the patterns documented in PATTERNS.md
 */

module.exports = {
  rules: {
    /**
     * Enforce using getIsSupabaseEnabled() instead of direct env checks
     */
    'no-direct-env-check': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow direct import.meta.env.VITE_USE_SUPABASE checks',
          category: 'Best Practices',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          MemberExpression(node) {
            // Check for import.meta.env.VITE_USE_SUPABASE
            if (
              node.object.type === 'MemberExpression' &&
              node.object.object.type === 'MetaProperty' &&
              node.object.object.meta.name === 'import' &&
              node.object.property.name === 'env' &&
              node.property.name === 'VITE_USE_SUPABASE'
            ) {
              context.report({
                node,
                message: 'Use getIsSupabaseEnabled() from @/config/env instead of direct env check',
                fix(fixer) {
                  // Add import if not present
                  const sourceCode = context.getSourceCode();
                  const imports = sourceCode.ast.body.filter(
                    n => n.type === 'ImportDeclaration'
                  );
                  
                  const hasImport = imports.some(
                    imp => imp.source.value === '@/config/env'
                  );
                  
                  const fixes = [];
                  
                  if (!hasImport) {
                    const lastImport = imports[imports.length - 1];
                    if (lastImport) {
                      fixes.push(
                        fixer.insertTextAfter(
                          lastImport,
                          "\nimport { getIsSupabaseEnabled } from '@/config/env';"
                        )
                      );
                    }
                  }
                  
                  // Replace the expression
                  fixes.push(
                    fixer.replaceText(node, 'getIsSupabaseEnabled()')
                  );
                  
                  return fixes;
                }
              });
            }
          }
        };
      }
    },

    /**
     * Enforce consistent Redux slice structure
     */
    'redux-slice-structure': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent Redux slice file structure',
          category: 'Stylistic Issues',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            
            // Only check slice files
            if (!filename.includes('Slice.ts')) return;
            
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();
            
            // Check for required imports
            const requiredImports = [
              '@reduxjs/toolkit',
              '@/config/env',
              '@/store'
            ];
            
            requiredImports.forEach(imp => {
              if (!text.includes(`from '${imp}'`)) {
                context.report({
                  node,
                  message: `Redux slice should import from '${imp}'`
                });
              }
            });
            
            // Check for required exports
            const requiredPatterns = [
              /export interface \w+State/,
              /const initialState/,
              /createAsyncThunk/,
              /createSlice/,
              /export const select/,
              /export default \w+Slice\.reducer/
            ];
            
            requiredPatterns.forEach((pattern, index) => {
              if (!pattern.test(text)) {
                const messages = [
                  'Missing state interface export',
                  'Missing initialState declaration',
                  'Missing createAsyncThunk usage',
                  'Missing createSlice usage',
                  'Missing selector exports',
                  'Missing default reducer export'
                ];
                
                context.report({
                  node,
                  message: messages[index]
                });
              }
            });
          }
        };
      }
    },

    /**
     * Enforce consistent API service structure
     */
    'api-service-structure': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent API service structure',
          category: 'Stylistic Issues',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            
            // Only check API files
            if (!filename.includes('/api/') || !filename.endsWith('Api.ts')) return;
            
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();
            
            // Check for required methods
            const requiredMethods = [
              'getAll',
              'getById',
              'create',
              'update',
              'delete'
            ];
            
            requiredMethods.forEach(method => {
              const pattern = new RegExp(`async ${method}\\s*\\(`);
              if (!pattern.test(text)) {
                context.report({
                  node,
                  message: `API service should include '${method}' method`
                });
              }
            });
            
            // Check for error handling
            if (!text.includes('handleSupabaseError')) {
              context.report({
                node,
                message: 'API service should use handleSupabaseError for error handling'
              });
            }
            
            // Check for console.error in catch blocks
            const catchPattern = /catch\s*\([^)]+\)\s*{[^}]*console\.error/g;
            if (!catchPattern.test(text)) {
              context.report({
                node,
                message: 'API service catch blocks should include console.error for debugging'
              });
            }
          }
        };
      }
    },

    /**
     * Enforce consistent component structure
     */
    'component-structure': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent React component structure',
          category: 'Stylistic Issues',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            
            // Only check component files
            if (!filename.includes('/components/') || !filename.endsWith('.tsx')) return;
            
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();
            
            // Check for TypeScript props interface
            if (!text.includes('Props') && !text.includes('props:')) {
              context.report({
                node,
                message: 'Component should have typed props'
              });
            }
            
            // Check for default export
            if (!text.includes('export default')) {
              context.report({
                node,
                message: 'Component should have a default export'
              });
            }
            
            // Check for loading state handling
            if (text.includes('isLoading') && !text.includes('LoadingState')) {
              context.report({
                node,
                message: 'Component with loading state should handle it properly'
              });
            }
            
            // Check for error state handling
            if (text.includes('error') && !text.includes('ErrorState')) {
              context.report({
                node,
                message: 'Component with error state should handle it properly'
              });
            }
          }
        };
      }
    },

    /**
     * Enforce using Redux hooks from store
     */
    'use-typed-redux-hooks': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce using typed Redux hooks',
          category: 'Best Practices',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            // Check for react-redux imports
            if (node.source.value === 'react-redux') {
              const hasUseSelector = node.specifiers.some(
                spec => spec.imported && spec.imported.name === 'useSelector'
              );
              const hasUseDispatch = node.specifiers.some(
                spec => spec.imported && spec.imported.name === 'useDispatch'
              );
              
              if (hasUseSelector || hasUseDispatch) {
                context.report({
                  node,
                  message: 'Use useAppSelector and useAppDispatch from @/store/hooks instead',
                  fix(fixer) {
                    return fixer.replaceText(
                      node,
                      "import { useAppDispatch, useAppSelector } from '@/store/hooks';"
                    );
                  }
                });
              }
            }
          }
        };
      }
    },

    /**
     * Enforce consistent test structure
     */
    'test-structure': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent test file structure',
          category: 'Stylistic Issues',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            
            // Only check test files
            if (!filename.includes('.test.')) return;
            
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();
            
            // Check for required test utilities
            if (!text.includes('renderWithProviders')) {
              context.report({
                node,
                message: 'Test should use renderWithProviders utility for consistent setup'
              });
            }
            
            // Check for describe blocks
            if (!text.includes('describe(')) {
              context.report({
                node,
                message: 'Tests should be organized in describe blocks'
              });
            }
            
            // Check for proper cleanup
            if (!text.includes('beforeEach') || !text.includes('clearAllMocks')) {
              context.report({
                node,
                message: 'Tests should clear mocks in beforeEach'
              });
            }
          }
        };
      }
    }
  }
};

/**
 * Recommended ESLint configuration to add to .eslintrc.json:
 * 
 * {
 *   "extends": ["./docs/patterns/eslint-custom-rules"],
 *   "rules": {
 *     "nelson-tech/no-direct-env-check": "error",
 *     "nelson-tech/redux-slice-structure": "warn",
 *     "nelson-tech/api-service-structure": "warn",
 *     "nelson-tech/component-structure": "warn",
 *     "nelson-tech/use-typed-redux-hooks": "error",
 *     "nelson-tech/test-structure": "warn"
 *   }
 * }
 */