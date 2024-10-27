// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

var esmModules = ["yaml"];

module.exports = {
  transformIgnorePatterns: [`node_modules/(?!(?:.pnpm/)?(${esmModules.join("|")}))`],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["index.js", "src/**"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  // coverageReporters: [["lcov", { projectRoot: "../../" }], "text-summary"],

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/test/**/?(*.)+(spec|test).js?(x)"],
  //testMatch: ["**/test/unit/core/Plugins.spec.js"],

  // The test environment that will be used for testing
  testEnvironment: "node",
};
