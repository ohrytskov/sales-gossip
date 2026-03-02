const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/jest/**/*.test.js'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/.open-next/', '<rootDir>/.wrangler/', '<rootDir>/out/'],
}

module.exports = createJestConfig(customJestConfig)
