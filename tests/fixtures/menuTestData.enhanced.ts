/**
 * Enhanced Test Fixtures and Mock Data for Menu Management
 * 
 * Comprehensive test data covering all scenarios, edge cases,
 * and data variations for thorough testing.
 */

import { faker } from '@faker-js/faker';
import { MenuItem, MenuItemInput, MenuType, MenuVisibility, MenuTarget } from '@/types/menu';

// Enhanced base mock data with comprehensive coverage
export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    title: 'Home',
    url: '/',
    description: 'Main landing page',
    menu_type: 'main',
    parent_id: null,
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: 'Home',
    css_classes: 'nav-home',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Community',
    url: '/community',
    description: 'Community hub and resources',
    menu_type: 'main',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: 'Users',
    css_classes: 'nav-community',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Events',
    url: '/events',
    description: 'Community events and meetups',
    menu_type: 'main',
    parent_id: '2',
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: 'Calendar',
    css_classes: 'nav-events',
    visibility: 'authenticated',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Directory',
    url: '/directory',
    description: 'Member directory',
    menu_type: 'main',
    parent_id: '2',
    sort_order: 1,
    is_enabled: false,
    target: '_self',
    icon: 'Book',
    css_classes: 'nav-directory',
    visibility: 'authenticated',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Admin Panel',
    url: '/admin',
    description: 'Administrative interface',
    menu_type: 'main',
    parent_id: null,
    sort_order: 2,
    is_enabled: true,
    target: '_self',
    icon: 'Settings',
    css_classes: 'nav-admin',
    visibility: 'admin',
    required_roles: ['admin', 'superadmin'],
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    title: 'External Resource',
    url: 'https://external-site.com',
    description: 'Link to external resource',
    menu_type: 'main',
    parent_id: null,
    sort_order: 3,
    is_enabled: true,
    target: '_blank',
    icon: 'ExternalLink',
    css_classes: 'nav-external',
    visibility: 'public',
    required_roles: null,
    is_external: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    title: 'About',
    url: '/about',
    description: 'About our organization',
    menu_type: 'footer',
    parent_id: null,
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: 'Info',
    css_classes: 'footer-about',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    title: 'Contact',
    url: '/contact',
    description: 'Contact information',
    menu_type: 'footer',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: 'Mail',
    css_classes: 'footer-contact',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '9',
    title: 'Mobile Home',
    url: '/',
    description: 'Mobile-specific home link',
    menu_type: 'mobile',
    parent_id: null,
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: 'Smartphone',
    css_classes: 'mobile-home',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    title: 'Role-Based Feature',
    url: '/role-feature',
    description: 'Feature accessible by specific roles',
    menu_type: 'main',
    parent_id: null,
    sort_order: 4,
    is_enabled: true,
    target: '_self',
    icon: 'Shield',
    css_classes: 'nav-role-based',
    visibility: 'role_based',
    required_roles: ['editor', 'moderator', 'admin'],
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Edge case test data
export const edgeCaseMenuItems: MenuItem[] = [
  {
    id: 'edge-1',
    title: '', // Empty title
    url: '/empty-title',
    description: null,
    menu_type: 'main',
    parent_id: null,
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'edge-2',
    title: 'A'.repeat(1000), // Very long title
    url: '/very-long-title',
    description: 'B'.repeat(2000), // Very long description
    menu_type: 'main',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: 'C'.repeat(500), // Very long CSS classes
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'edge-3',
    title: 'Unicode Test 测试 🎉 العربية',
    url: '/unicode-test',
    description: 'Testing unicode: αβγδε ñáéíóú çğışü',
    menu_type: 'main',
    parent_id: null,
    sort_order: 2,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'edge-4',
    title: 'Circular Parent',
    url: '/circular',
    description: 'Item with circular parent reference',
    menu_type: 'main',
    parent_id: 'edge-5', // Points to child
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'edge-5',
    title: 'Circular Child',
    url: '/circular-child',
    description: 'Item with circular child reference',
    menu_type: 'main',
    parent_id: 'edge-4', // Points to parent
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'edge-6',
    title: 'Orphaned Item',
    url: '/orphaned',
    description: 'Item with non-existent parent',
    menu_type: 'main',
    parent_id: 'non-existent-parent',
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'edge-7',
    title: 'Special Characters',
    url: '/special-chars',
    description: 'Contains: <script>alert("XSS")</script> & "quotes" \'single\' \\backslash',
    menu_type: 'main',
    parent_id: null,
    sort_order: 3,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: 'class-with-<script>',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Performance test data - large datasets
export const createLargeMenuDataset = (count: number): MenuItem[] => {
  return Array.from({ length: count }, (_, i) => createMockMenuItem({
    id: `perf-${i}`,
    title: `Performance Test Item ${i + 1}`,
    url: `/perf-test-${i + 1}`,
    description: `Generated item ${i + 1} for performance testing`,
    sort_order: i,
    parent_id: i > 0 && i % 10 === 0 ? `perf-${i - 1}` : null, // Every 10th item has a parent
  }));
};

// Deep hierarchy test data
export const createDeepHierarchy = (depth: number): MenuItem[] => {
  const items: MenuItem[] = [];
  let parentId: string | null = null;

  for (let i = 0; i < depth; i++) {
    const id = `deep-${i}`;
    items.push(createMockMenuItem({
      id,
      title: `Level ${i + 1} Item`,
      url: `/level-${i + 1}`,
      parent_id: parentId,
      sort_order: 0,
    }));
    parentId = id;
  }

  return items;
};

// Multi-language test data
export const multiLanguageMenuItems: MenuItem[] = [
  {
    id: 'lang-en',
    title: 'English Menu',
    url: '/en/menu',
    description: 'English language menu item',
    menu_type: 'main',
    parent_id: null,
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: 'Globe',
    css_classes: 'lang-en',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lang-es',
    title: 'Menú Español',
    url: '/es/menu',
    description: 'Elemento del menú en español',
    menu_type: 'main',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: 'Globe',
    css_classes: 'lang-es',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lang-zh',
    title: '中文菜单',
    url: '/zh/menu',
    description: '中文菜单项目',
    menu_type: 'main',
    parent_id: null,
    sort_order: 2,
    is_enabled: true,
    target: '_self',
    icon: 'Globe',
    css_classes: 'lang-zh',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lang-ar',
    title: 'القائمة العربية',
    url: '/ar/menu',
    description: 'عنصر القائمة باللغة العربية',
    menu_type: 'main',
    parent_id: null,
    sort_order: 3,
    is_enabled: true,
    target: '_self',
    icon: 'Globe',
    css_classes: 'lang-ar',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Security test data - potentially malicious inputs
export const securityTestInputs = {
  xssAttempts: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)">',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '\'; alert(\'XSS\'); //',
    '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
  ],
  sqlInjectionAttempts: [
    '\' OR 1=1 --',
    '\'; DROP TABLE menu_items; --',
    '\' UNION SELECT * FROM users --',
    '\' INSERT INTO users (role) VALUES (\'admin\'); --',
    '1\' AND (SELECT COUNT(*) FROM menu_items) > 0 --',
  ],
  pathTraversalAttempts: [
    '../../../etc/passwd',
    '..\\..\\windows\\system32\\config\\sam',
    '/../../sensitive-data',
    '\\..\\..\\sensitive-file',
  ],
  overflowAttempts: [
    'A'.repeat(10000),
    'B'.repeat(100000),
    Array(1000).fill('overflow').join(''),
  ],
};

// User role test data
export const userRoleTestData = {
  superadmin: {
    roles: ['superadmin'],
    canAccess: ['public', 'authenticated', 'admin', 'role_based'],
    canModify: true,
  },
  admin: {
    roles: ['admin'],
    canAccess: ['public', 'authenticated', 'admin'],
    canModify: true,
  },
  editor: {
    roles: ['editor'],
    canAccess: ['public', 'authenticated'],
    canModify: false,
  },
  user: {
    roles: ['user'],
    canAccess: ['public', 'authenticated'],
    canModify: false,
  },
  anonymous: {
    roles: [],
    canAccess: ['public'],
    canModify: false,
  },
  multiRole: {
    roles: ['user', 'editor', 'moderator'],
    canAccess: ['public', 'authenticated'],
    canModify: false,
  },
};

// Browser compatibility test data
export const browserTestData = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],
  viewports: [
    { width: 1920, height: 1080, name: 'Desktop FHD' },
    { width: 1366, height: 768, name: 'Desktop HD' },
    { width: 1024, height: 768, name: 'Tablet Landscape' },
    { width: 768, height: 1024, name: 'Tablet Portrait' },
    { width: 414, height: 896, name: 'iPhone 11 Pro' },
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 360, height: 640, name: 'Android Small' },
  ],
};

// API response mocks for different scenarios
export const apiResponseMocks = {
  success: {
    data: mockMenuItems,
    error: null,
    status: 200,
  },
  empty: {
    data: [],
    error: null,
    status: 200,
  },
  serverError: {
    data: null,
    error: {
      message: 'Internal Server Error',
      code: 'SERVER_ERROR',
      status: 500,
    },
    status: 500,
  },
  notFound: {
    data: null,
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND',
      status: 404,
    },
    status: 404,
  },
  forbidden: {
    data: null,
    error: {
      message: 'Forbidden',
      code: 'FORBIDDEN',
      status: 403,
    },
    status: 403,
  },
  rateLimited: {
    data: null,
    error: {
      message: 'Too Many Requests',
      code: 'RATE_LIMIT',
      status: 429,
      retryAfter: 60,
    },
    status: 429,
  },
  timeout: {
    data: null,
    error: {
      message: 'Request Timeout',
      code: 'TIMEOUT',
      status: 408,
    },
    status: 408,
  },
  malformed: {
    data: 'invalid json response',
    error: null,
    status: 200,
  },
  corrupted: {
    data: [
      { id: '1' }, // Missing required fields
      null,
      undefined,
      { id: '2', title: null, url: undefined },
      'not_an_object',
    ],
    error: null,
    status: 200,
  },
};

// Utility function to create mock menu item with overrides
export const createMockMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: faker.string.uuid(),
  title: faker.lorem.words(2),
  url: `/${faker.helpers.slugify(faker.lorem.words(2)).toLowerCase()}`,
  description: faker.lorem.sentence(),
  menu_type: faker.helpers.arrayElement(['main', 'footer', 'mobile', 'admin'] as MenuType[]),
  parent_id: null,
  sort_order: faker.number.int({ min: 0, max: 100 }),
  is_enabled: faker.datatype.boolean(),
  target: faker.helpers.arrayElement(['_self', '_blank', '_parent', '_top'] as MenuTarget[]),
  icon: faker.helpers.arrayElement(['Home', 'Users', 'Settings', 'Mail', 'Globe', null]),
  css_classes: faker.datatype.boolean() ? faker.lorem.word() : null,
  visibility: faker.helpers.arrayElement(['public', 'authenticated', 'admin', 'role_based'] as MenuVisibility[]),
  required_roles: faker.datatype.boolean() ? faker.helpers.arrayElements(['admin', 'editor', 'moderator'], { min: 1, max: 3 }) : null,
  is_external: faker.datatype.boolean(),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
});

// Utility function to create mock menu input
export const createMockMenuInput = (overrides: Partial<MenuItemInput> = {}): MenuItemInput => ({
  title: faker.lorem.words(2),
  url: `/${faker.helpers.slugify(faker.lorem.words(2)).toLowerCase()}`,
  description: faker.lorem.sentence(),
  menu_type: faker.helpers.arrayElement(['main', 'footer', 'mobile', 'admin'] as MenuType[]),
  parent_id: null,
  sort_order: faker.number.int({ min: 0, max: 100 }),
  is_enabled: true,
  target: '_self',
  icon: faker.helpers.arrayElement(['Home', 'Users', 'Settings', 'Mail', 'Globe', null]),
  css_classes: faker.datatype.boolean() ? faker.lorem.word() : null,
  visibility: 'public',
  required_roles: null,
  is_external: false,
  ...overrides,
});

// Test scenario generators
export const testScenarios = {
  basicCRUD: () => ({
    create: createMockMenuInput({ title: 'Test Create Item' }),
    update: { title: 'Test Updated Item', description: 'Updated description' },
    delete: mockMenuItems[0],
  }),
  
  hierarchical: () => {
    const parent = createMockMenuItem({ title: 'Parent Item', parent_id: null });
    const children = Array.from({ length: 3 }, (_, i) => 
      createMockMenuItem({
        title: `Child Item ${i + 1}`,
        parent_id: parent.id,
        sort_order: i,
      })
    );
    return { parent, children, all: [parent, ...children] };
  },
  
  permissions: () => ({
    public: createMockMenuItem({ visibility: 'public', required_roles: null }),
    authenticated: createMockMenuItem({ visibility: 'authenticated', required_roles: null }),
    admin: createMockMenuItem({ visibility: 'admin', required_roles: ['admin'] }),
    roleBased: createMockMenuItem({ 
      visibility: 'role_based', 
      required_roles: ['editor', 'moderator'] 
    }),
  }),
  
  menuTypes: () => ({
    main: createMockMenuItem({ menu_type: 'main' }),
    footer: createMockMenuItem({ menu_type: 'footer' }),
    mobile: createMockMenuItem({ menu_type: 'mobile' }),
    admin: createMockMenuItem({ menu_type: 'admin' }),
  }),
  
  external: () => ({
    internal: createMockMenuItem({ 
      url: '/internal-page', 
      is_external: false,
      target: '_self' 
    }),
    external: createMockMenuItem({ 
      url: 'https://external-site.com', 
      is_external: true,
      target: '_blank' 
    }),
  }),
};

// Export all test data collections
export const testData = {
  basic: mockMenuItems,
  edgeCases: edgeCaseMenuItems,
  multiLanguage: multiLanguageMenuItems,
  security: securityTestInputs,
  userRoles: userRoleTestData,
  browser: browserTestData,
  apiMocks: apiResponseMocks,
  scenarios: testScenarios,
};

export default testData;