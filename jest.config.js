module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/tests/**/*.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
  coverageDirectory: '.coverage',
  collectCoverageFrom: ['lib/**/*.{ts,tsx,js,jsx}', '!lib/**/*.d.ts', '!lib/**/index.ts'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 35,
      functions: 100,
      lines: 80
    }
  },
  collectCoverage: false
};
