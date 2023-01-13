module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  transformIgnorePatterns: ["^.+\\.js$"],
  silent: true,
  collectCoverage: true,
  coverageReporters: ["lcov", "cobertura"],
  coverageDirectory: "<rootDir>/coverage/my-app",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./coverage",
        outputName: "TESTS-my-app.xml",
      },
    ],
  ],
};