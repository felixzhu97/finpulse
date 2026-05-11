/** @type {import('jest').Config} */
module.exports = {
  preset: undefined,
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  // Coverage thresholds - store and utils at higher standards
  coverageThreshold: {
    "./src/presentation/store/": {
      branches: 30,
      functions: 50,
      lines: 48,
      statements: 50,
    },
    "./src/domain/entities/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./src/presentation/utils/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
