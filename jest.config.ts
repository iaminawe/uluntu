/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/src/setupTests.ts', '<rootDir>/src/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        astTransformers: {
          before: [
            {
              path: './jest-ts-import-meta-env-transformer.js', // path to your transformer
              options: {},
            },
          ],
        },
      },
    ],
  },

  // Ignore transformations for node_modules except for specific packages
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|@testing-library)/)',
  ],
};

export default config;