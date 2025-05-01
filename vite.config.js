import react from '@vitejs/plugin-react';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import path from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/smart-cube-timer',
  esbuild: {
    loader: 'tsx',
    include: /\.(ts|tsx|js|jsx)$/,
    exclude: [],
  },
  plugins: [
    react(),
    svgr(),
    eslint({
      fix: true,
      lintOnStart: true,
      failOnError: false,
    }),
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        'prettier': prettier,
      },
      rules: {
        'prettier/prettier': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'no-unused-vars': 'warn',
      },
    },
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Smart Cube Timer',
        short_name: 'Smart Cube Timer',
        description: 'Smart Cube Timer',
        icons: [
          {
            src: 'icons/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        screenshots: [

          {
            src: 'screenshots/dark-screenshot-desktop.jpg',
            sizes: '1280x782',
            type: 'image/jpg',
            form_factor: 'wide',
            label: 'Desktop dark',
          },
          {
            src: 'screenshots/light-screenshot-desktop.jpg',
            sizes: '1280x782',
            type: 'image/jpg',
            form_factor: 'wide',
            label: 'Desktop light',
          },
          {
            src: 'screenshots/dark-screenshot-mobile.jpg',
            sizes: '575x1280',
            type: 'image/jpg',
            label: 'Mobile dark',
          },
          {
            src: 'screenshots/light-screenshot-mobile.jpg',
            sizes: '575x1280',
            type: 'image/jpg',
            label: 'Mobile light',
          },
        ],
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#000000',
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: false,
        globPatterns: ['**/*.{js,css,html,png,svg}'],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  optimizeDeps: {
    exclude: ['cubing'],
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'worker/[name].[hash].js',
        chunkFileNames: 'worker/[name].[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
