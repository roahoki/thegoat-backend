import js from '@eslint/js';
import globals from 'globals';

export default [
  // Use the recommended config from @eslint/js
  js.configs.recommended,

  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Include Node.js globals
        ...globals.node,
        // Include ES6+ globals
        ...globals.es2023,
      },
    },

    rules: {
      // Your custom rules
      'no-console': 'warn',
      // Add more custom rules if needed
    },
  },
];
