const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ignores: ['.expo/**', 'dist/**', 'node_modules/**'],
  },
  expoConfig,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
