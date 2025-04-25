import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  commonjs()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  worker: {
    format: 'es',
    plugins: () => [
      {
        name: 'fix-worker-urls',
        transform(code) {
          // Fix worker instantiation for cubing.js
          return code.replace(
              /import\.meta\.resolve\((['"]\.\/[^'"]+['"])\)/g,
              'new URL($1, import.meta.url).href'
          )
        }
      }
    ]
  }
});

