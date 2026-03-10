/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: ['node_modules', 'dist', '.next', 'out', 'build'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      extends: ['eslint:recommended', 'prettier'],
      plugins: ['@typescript-eslint'],
      rules: {},
    },
  ],
};
