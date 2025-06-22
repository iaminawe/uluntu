import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  category: string;
  test: string;
  result: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

class SimpleIntegrationValidator {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  async validateAll() {
    console.log('🔍 Starting Integration Validation...');
    console.log('================================\n');

    this.validateAPIIntegration();
    this.validateTypeSafety();
    this.validateAuthenticationFlow();
    this.validateDataSourceSwitching();
    this.validateNavigationAndRouting();

    this.generateReport();
  }

  private validateAPIIntegration() {
    console.log('1️⃣ Validating API Integration...');

    // Check if all API files exist and follow the pattern
    const apiFiles = [
      'src/features/news/api/newsApi.ts',
      'src/features/events/api/eventsApi.ts',
      'src/features/marketplace/api/marketplaceApi.ts',
      'src/features/opportunities/api/opportunitiesApi.ts',
      'src/features/companies/api/companiesApi.ts',
      'src/features/groups/api/groupsApi.ts',
      'src/features/resources/api/resourcesApi.ts'
    ];

    apiFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const hasCRUD = 
          content.includes('getAll') &&
          content.includes('getById') &&
          content.includes('create') &&
          content.includes('update') &&
          content.includes('delete');

        this.results.push({
          category: 'API Integration',
          test: `${file} - CRUD operations`,
          result: hasCRUD ? 'PASS' : 'WARN',
          message: hasCRUD ? 'All CRUD operations defined' : 'Some CRUD operations missing',
          severity: 'high'
        });
      } else {
        this.results.push({
          category: 'API Integration',
          test: `${file} existence`,
          result: 'FAIL',
          message: 'API file not found',
          severity: 'critical'
        });
      }
    });

    // Check Redux integration
    const sliceFiles = [
      'src/features/news/store/newsSlice.ts',
      'src/features/events/store/eventsSlice.ts',
      'src/features/marketplace/store/marketplaceSlice.ts'
    ];

    sliceFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const hasAsyncThunks = content.includes('createAsyncThunk');
        const importsFromApi = content.includes('/api/');

        this.results.push({
          category: 'API Integration',
          test: `${file} - Redux integration`,
          result: hasAsyncThunks && importsFromApi ? 'PASS' : 'FAIL',
          message: hasAsyncThunks && importsFromApi 
            ? 'Redux slice properly integrated with API'
            : 'Redux slice missing API integration',
          severity: 'critical'
        });
      }
    });
  }

  private validateTypeSafety() {
    console.log('\n2️⃣ Validating Type Safety...');

    // Check for TypeScript configuration
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      const strict = tsconfig.compilerOptions?.strict;
      const noImplicitAny = tsconfig.compilerOptions?.noImplicitAny;

      this.results.push({
        category: 'Type Safety',
        test: 'TypeScript strict mode',
        result: strict ? 'PASS' : 'WARN',
        message: strict ? 'Strict mode enabled' : 'Strict mode not enabled',
        severity: 'high'
      });

      this.results.push({
        category: 'Type Safety',
        test: 'No implicit any',
        result: noImplicitAny !== false ? 'PASS' : 'FAIL',
        message: noImplicitAny !== false ? 'No implicit any enabled' : 'Implicit any allowed',
        severity: 'medium'
      });
    }

    // Check for type definitions
    const typeFiles = [
      'src/types/content.ts',
      'src/types/supabase.ts',
      'src/types/common.ts'
    ];

    typeFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      
      this.results.push({
        category: 'Type Safety',
        test: `${file} existence`,
        result: exists ? 'PASS' : 'FAIL',
        message: exists ? 'Type definition file exists' : 'Type definition file missing',
        severity: 'high'
      });
    });

    // Check for proper typing in API files
    const newsApiPath = path.join(this.projectRoot, 'src/features/news/api/newsApi.ts');
    if (fs.existsSync(newsApiPath)) {
      const content = fs.readFileSync(newsApiPath, 'utf-8');
      const hasProperTypes = 
        content.includes(': Promise<') &&
        content.includes('NewsArticle') &&
        !content.includes(': any');

      this.results.push({
        category: 'Type Safety',
        test: 'API return types',
        result: hasProperTypes ? 'PASS' : 'FAIL',
        message: hasProperTypes 
          ? 'APIs have proper return types' 
          : 'APIs missing proper return types',
        severity: 'high'
      });
    }
  }

  private validateAuthenticationFlow() {
    console.log('\n3️⃣ Validating Authentication Flow...');

    // Check auth components
    const authFiles = [
      'src/features/auth/components/ProtectedRoute.tsx',
      'src/features/auth/components/GroupGuard.tsx',
      'src/lib/supabase.ts'
    ];

    authFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      
      this.results.push({
        category: 'Authentication',
        test: `${file} existence`,
        result: exists ? 'PASS' : 'FAIL',
        message: exists ? 'Auth component exists' : 'Auth component missing',
        severity: 'critical'
      });
    });

    // Check ProtectedRoute implementation
    const protectedRoutePath = path.join(this.projectRoot, 'src/features/auth/components/ProtectedRoute.tsx');
    if (fs.existsSync(protectedRoutePath)) {
      const content = fs.readFileSync(protectedRoutePath, 'utf-8');
      const hasRoleCheck = content.includes('requiredRoles');
      const hasAuthCheck = content.includes('user') && content.includes('Navigate');

      this.results.push({
        category: 'Authentication',
        test: 'ProtectedRoute implementation',
        result: hasRoleCheck && hasAuthCheck ? 'PASS' : 'WARN',
        message: hasRoleCheck && hasAuthCheck
          ? 'ProtectedRoute has proper auth and role checks'
          : 'ProtectedRoute missing some checks',
        severity: 'high'
      });
    }

    // Check supabase auth configuration
    const supabasePath = path.join(this.projectRoot, 'src/lib/supabase.ts');
    if (fs.existsSync(supabasePath)) {
      const content = fs.readFileSync(supabasePath, 'utf-8');
      const hasAuthConfig = 
        content.includes('autoRefreshToken') &&
        content.includes('persistSession') &&
        content.includes('storageKey');

      this.results.push({
        category: 'Authentication',
        test: 'Supabase auth configuration',
        result: hasAuthConfig ? 'PASS' : 'FAIL',
        message: hasAuthConfig
          ? 'Supabase auth properly configured'
          : 'Supabase auth configuration incomplete',
        severity: 'critical'
      });
    }
  }

  private validateDataSourceSwitching() {
    console.log('\n4️⃣ Validating Data Source Switching...');

    // Check env configuration
    const envConfigPath = path.join(this.projectRoot, 'src/config/env.ts');
    if (fs.existsSync(envConfigPath)) {
      const content = fs.readFileSync(envConfigPath, 'utf-8');
      const hasSupabaseFlag = content.includes('IS_SUPABASE_ENABLED');
      const hasGetterFunction = content.includes('getIsSupabaseEnabled');

      this.results.push({
        category: 'Data Source',
        test: 'Environment configuration',
        result: hasSupabaseFlag && hasGetterFunction ? 'PASS' : 'FAIL',
        message: hasSupabaseFlag && hasGetterFunction
          ? 'Environment switching properly configured'
          : 'Environment switching configuration missing',
        severity: 'critical'
      });
    }

    // Check Redux slices for data source switching
    const newsSlicePath = path.join(this.projectRoot, 'src/features/news/store/newsSlice.ts');
    if (fs.existsSync(newsSlicePath)) {
      const content = fs.readFileSync(newsSlicePath, 'utf-8');
      const hasDataSourceCheck = 
        content.includes('getIsSupabaseEnabled') &&
        content.includes('mockQueries');

      this.results.push({
        category: 'Data Source',
        test: 'Redux data source switching',
        result: hasDataSourceCheck ? 'PASS' : 'FAIL',
        message: hasDataSourceCheck
          ? 'Redux slices support data source switching'
          : 'Redux slices missing data source switching',
        severity: 'high'
      });
    }

    // Check for mock data
    const mockDataExists = fs.existsSync(path.join(this.projectRoot, 'src/mocks'));
    this.results.push({
      category: 'Data Source',
      test: 'Mock data availability',
      result: mockDataExists ? 'PASS' : 'FAIL',
      message: mockDataExists
        ? 'Mock data directory exists'
        : 'Mock data directory missing',
      severity: 'high'
    });
  }

  private validateNavigationAndRouting() {
    console.log('\n5️⃣ Validating Navigation and Routing...');

    // Check router configuration
    const routerPath = path.join(this.projectRoot, 'src/routes/index.tsx');
    if (fs.existsSync(routerPath)) {
      const content = fs.readFileSync(routerPath, 'utf-8');
      
      // Check for required routes
      const requiredRoutes = [
        'directory', 'companies', 'events', 'news', 'groups',
        'resources', 'marketplace', 'opportunities', 'signin', 'signup',
        'admin'
      ];

      const missingRoutes = requiredRoutes.filter(route => !content.includes(`path: '${route}'`));
      
      this.results.push({
        category: 'Navigation',
        test: 'Required routes defined',
        result: missingRoutes.length === 0 ? 'PASS' : 'FAIL',
        message: missingRoutes.length === 0
          ? 'All required routes defined'
          : `Missing routes: ${missingRoutes.join(', ')}`,
        severity: 'critical'
      });

      // Check for protected routes
      const hasProtectedRoutes = content.includes('<ProtectedRoute>');
      const hasRoleBasedRoutes = content.includes('requiredRoles');

      this.results.push({
        category: 'Navigation',
        test: 'Protected routes implementation',
        result: hasProtectedRoutes && hasRoleBasedRoutes ? 'PASS' : 'WARN',
        message: hasProtectedRoutes && hasRoleBasedRoutes
          ? 'Protected routes properly implemented'
          : 'Some protected route features missing',
        severity: 'high'
      });

      // Check for error boundary
      const hasErrorBoundary = content.includes('errorElement');
      this.results.push({
        category: 'Navigation',
        test: 'Error boundary implementation',
        result: hasErrorBoundary ? 'PASS' : 'FAIL',
        message: hasErrorBoundary
          ? 'Error boundaries configured'
          : 'Error boundaries missing',
        severity: 'medium'
      });
    } else {
      this.results.push({
        category: 'Navigation',
        test: 'Router configuration',
        result: 'FAIL',
        message: 'Router configuration file not found',
        severity: 'critical'
      });
    }
  }

  private generateReport() {
    const reportPath = path.join(this.projectRoot, 'reports', 'integration-validation.md');
    const reportsDir = path.dirname(reportPath);
    
    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    let report = '# Integration Validation Report\n\n';
    report += `Generated on: ${new Date().toISOString()}\n\n`;

    // Summary
    const passed = this.results.filter(r => r.result === 'PASS').length;
    const failed = this.results.filter(r => r.result === 'FAIL').length;
    const warnings = this.results.filter(r => r.result === 'WARN').length;
    const total = this.results.length;

    report += '## Summary\n\n';
    report += `- **Total Tests**: ${total}\n`;
    report += `- **Passed**: ${passed} ✅\n`;
    report += `- **Failed**: ${failed} ❌\n`;
    report += `- **Warnings**: ${warnings} ⚠️\n`;
    report += `- **Success Rate**: ${((passed / total) * 100).toFixed(1)}%\n\n`;

    // Results by category
    const categories = [...new Set(this.results.map(r => r.category))];
    
    report += '## Test Results\n\n';
    categories.forEach(category => {
      report += `### ${category}\n\n`;
      
      const categoryResults = this.results.filter(r => r.category === category);
      report += '| Test | Result | Message | Severity |\n';
      report += '|------|--------|---------|----------|\n';
      
      categoryResults.forEach(result => {
        const icon = result.result === 'PASS' ? '✅' : result.result === 'FAIL' ? '❌' : '⚠️';
        report += `| ${result.test} | ${icon} ${result.result} | ${result.message} | ${result.severity || 'medium'} |\n`;
      });
      report += '\n';
    });

    // Critical issues
    const criticalIssues = this.results.filter(r => r.result === 'FAIL' && r.severity === 'critical');
    if (criticalIssues.length > 0) {
      report += '## 🚨 Critical Issues\n\n';
      criticalIssues.forEach((issue, index) => {
        report += `${index + 1}. **${issue.test}**: ${issue.message}\n`;
      });
      report += '\n';
    }

    // Recommendations
    report += '## 💡 Recommendations\n\n';
    report += '### Priority 1 (Critical)\n\n';
    if (criticalIssues.length > 0) {
      report += '1. Fix all critical issues immediately:\n';
      criticalIssues.forEach(issue => {
        report += `   - ${issue.category}: ${issue.test}\n`;
      });
    }

    report += '\n### Priority 2 (High)\n\n';
    const highIssues = this.results.filter(r => r.result === 'FAIL' && r.severity === 'high');
    if (highIssues.length > 0) {
      report += '1. Address high-severity failures:\n';
      highIssues.forEach(issue => {
        report += `   - ${issue.category}: ${issue.test}\n`;
      });
    }

    report += '\n### Priority 3 (Medium)\n\n';
    report += '1. Review and fix warning issues\n';
    report += '2. Add more comprehensive integration tests\n';
    report += '3. Set up continuous integration to run these validations\n';
    report += '4. Implement end-to-end testing for critical user flows\n';

    report += '\n## Next Steps\n\n';
    report += '1. Review this report with the development team\n';
    report += '2. Create tickets for each critical and high-priority issue\n';
    report += '3. Establish a regular validation schedule\n';
    report += '4. Update validation tests as new features are added\n';

    // Write report to file
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report written to: ${reportPath}`);

    // Also display summary in console
    console.log('\n\n📊 INTEGRATION VALIDATION REPORT');
    console.log('==================================\n');
    
    categories.forEach(category => {
      console.log(`\n${category}:`);
      console.log('-'.repeat(category.length + 1));
      
      const categoryResults = this.results.filter(r => r.category === category);
      categoryResults.forEach(result => {
        const icon = result.result === 'PASS' ? '✅' : result.result === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${result.test}: ${result.message}`);
      });
    });

    console.log('\n\nSUMMARY:');
    console.log('--------');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  }
}

// Run the validation
const validator = new SimpleIntegrationValidator();
validator.validateAll();
