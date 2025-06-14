/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/src/setupTests.ts', '<rootDir>/src/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@reduxjs))'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },

  // Ignore transformations for node_modules except for specific packages
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|@testing-library)/)',
  ],
};

export default config;