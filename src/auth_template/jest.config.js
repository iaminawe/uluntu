module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    // Mock the supabase module to avoid import.meta.env issues
    '^../../lib/supabase$': '<rootDir>/../tests/__mocks__/supabase.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};