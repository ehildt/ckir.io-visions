export default {
  preset: "ts-jest",
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: false,
  reporters: ["default"],
  coverageReporters: ["clover", "json", "cobertura"],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
  collectCoverageFrom: ["!**/dist/**"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "identity-obj-proxy",
  },
  coverageDirectory: "<rootDir>/coverage",
  setupFilesAfterEnv: ["jest-extended/all"],
  moduleDirectories: ["node_modules"],
};
