import react from "@vitejs/plugin-react";
import path from "path";
import {defineConfig} from 'vite'
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
    base: "/smart-cube-timer",
    plugins: [
        react(),
        VitePWA({
            manifest: {
                name: 'Smart Cube Timer',
                short_name: 'Smart Cube Timer',
                description: 'Smart Cube Timer',
                icons: [
                    {
                        src: 'icons/logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                display: "standalone",
                theme_color: "#000000",
                background_color: "#ffffff"
            },
            devOptions: {
                enabled: true,
                type: 'module'
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,png,svg}']
            }
        })
    ],
    build: {
        chunkSizeWarningLimit: 2048,
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name].[hash].[ext]',
                chunkFileNames: 'assets/[name].[hash].js',
                entryFileNames: 'assets/[name].[hash].js'
            }
        }
    },
    optimizeDeps: {
        exclude: ["cubing"]
    },
    worker: {
        format: 'es',
        rollupOptions: {
            output: {
                entryFileNames: 'worker/[name].[hash].js',
                chunkFileNames: 'worker/[name].[hash].js'
            }
        }
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, "src"),
        }
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        }
    }
});
