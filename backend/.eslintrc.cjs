const path = require('node:path');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['.eslintrc.cjs'],
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.eslint.json')],
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  }
};
