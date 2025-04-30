import js from '@eslint/js';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';

export default [
  // Base ignores (replaces .eslintignore)
  {
    ignores: [
      '**/*.ts',
      'node_modules/',
      'dist/',
      'dev-dist',
      'coverage/',
      'public/',
      'build/',
    ],
  },

  // Recommended JavaScript rules
  js.configs.recommended,

  // React recommended config
  reactRecommended,

  // Project-specific configuration
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      // React Refresh (for Vite)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // JavaScript rules
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'arrow-body-style': ['error', 'as-needed'],

      // Style preferences
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
];
