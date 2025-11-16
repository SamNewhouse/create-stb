module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/bin"],
  testMatch: ["**/*.test.ts"],
  collectCoverage: false,
};
