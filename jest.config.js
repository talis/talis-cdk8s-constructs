/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  setupFilesAfterEnv: ["./test/jest.setup.js"],
  collectCoverageFrom: ["**/*.ts", "!**/node_modules/**", "!**/imports/**"],
  coverageReporters: ["clover", "json", "lcov", "text", "html-spa"],
};
