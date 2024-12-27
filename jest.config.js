/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|js)$": ["ts-jest", {}],
  },
  testMatch: ["<rootDir>/tests/**/*.(test|spec).(ts|js)"],
};
