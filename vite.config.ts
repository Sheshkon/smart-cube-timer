
import { defineConfig } from 'vite'
import { VitePWA } from "vite-plugin-pwa";

const workerImportMetaUrlRE = /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/g;

export default defineConfig({
    base: "/smart-cube-timer",
    plugins: [
        VitePWA({
            manifest: {
                name: 'Smart Cube Timer',
                short_name: 'Smart Cube Timer',
                description: 'Smart Cube Timer',
                icons: [
                    {
                        src: 'icons/icon.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                display: "standalone",
                theme_color: "#000000",
                background_color: "#ffffff",
                screenshots: [
                    {
                        src: "icons/icon.png",
                        sizes: "512x512",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Rubik's cube"
                    },
                    {
                        src: "icons/icon.png",
                        sizes: "512x512",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "Rubik's cube"
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    build: {
        chunkSizeWarningLimit: 2048
    },
    optimizeDeps: {
        exclude: ["cubing"]
    },
    worker: {
        format: 'es',
        plugins: () => [
            {
                name: 'disable-nested-workers',
                enforce: 'pre',
                transform(code, id) {
                    if (code.includes('new Worker') && code.includes('new URL') && code.includes('import.meta.url')) {
                        const result = code.replace(workerImportMetaUrlRE, `((() => { throw new Error('Nested workers are disabled') })()`);
                        return result;
                    }
                }
            }
        ],
        rollupOptions: {
            output: {
                chunkFileNames: 'assets/worker/[name]-[hash].js',
                assetFileNames: 'assets/worker/[name]-[hash].js'
            }
        }
    }
});

