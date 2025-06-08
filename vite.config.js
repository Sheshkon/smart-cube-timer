import path from 'path';

import react from '@vitejs/plugin-react';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/smart-cube-timer/',
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
        description: 'Timer for GAN smart cubes',
        icons: [
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'icons/icon512_maskable.png',
            type: 'image/png',
          },
          {
            purpose: 'any',
            sizes: '512x512',
            src: 'icons/icon512_rounded.png',
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
        orientation: 'any',
        display: 'standalone',
        lang: 'en-US',
        theme_color: '#000000',
        background_color: '#000000',
        handle_links: 'preferred',
        scope_extensions: [
          { origin: 'https://sheshkon.github.io' },
          { origin: 'https://*.github.io/sheshkon' },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        dontCacheBustURLsMatching: /\.\w{8}\./,
        modifyURLPrefix: {
          '': '/smart-cube-timer/',
        },
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          {
            urlPattern: /\/smart-cube-timer\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
              },
            },
          },
        ],
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
    include: [
      'cubing/twisty',
      // 'cubing/worker',
    ],
    exclude: [
      'search-worker-entry',
      // 'cubing'
    ],
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
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
});
