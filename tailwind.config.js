/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'class', // or 'media' if you prefer OS-based dark mode
    theme: {
        extend: {}, // You can extend Tailwind's default theme here
    },
    plugins: [
        require('daisyui') // Add DaisyUI plugin
    ],
    daisyui: {
        themes: [
            'dark',
            'light --default',
        ]
    },
};