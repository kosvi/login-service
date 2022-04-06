/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist','db'],
  collectCoverage: true,
  coverageReporters: ['html', 'text'],
  coveragePathIgnorePatterns: [
    'node_modules', 'db'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  watchPathIgnorePatterns: [
    'db'
  ]
};
