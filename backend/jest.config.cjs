module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'nodenext'
      }
    }
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};
