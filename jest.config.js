/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  coverageProvider: "babel",
  clearMocks: true,
  preset: "ts-jest",
  moduleDirectories: ["node_modules", "test"],
  modulePathIgnorePatterns: ["spec.js", "spec.ts", "spec.tsx"],
};
