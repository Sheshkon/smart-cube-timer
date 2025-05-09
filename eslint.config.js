import path from 'path';
import { fileURLToPath } from 'url';

import js from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      'import/resolver': {
        node: {
          paths: [path.resolve(__dirname, 'src')], // Add your src path
          extensions: ['.js', '.jsx'],
          caseSensitive: true, // Enforce case sensitivity
        },
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
      'import': eslintPluginImport,
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

      // Import
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal'],
          'pathGroups': [
            {
              'pattern': 'react',
              'group': 'external',
              'position': 'before'
            }
          ],
          'pathGroupsExcludedImportTypes': ['react'],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
    },
  },
];
