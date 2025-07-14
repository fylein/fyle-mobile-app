module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/readme.validation.test.js'],
  collectCoverageFrom: ['README.md'],
  coverageDirectory: 'coverage/readme',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true
};