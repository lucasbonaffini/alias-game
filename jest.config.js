/** @type {import('jest').Config} */

const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  testMatch: [
    "**/*.test.js"
  ],
};

module.exports = config;