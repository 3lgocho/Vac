/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")], // <--- ESTA ES LA LÍNEA MÁGICA QUE FALTABA
    theme: {
        extend: {
            colors: {
                "primary": "#006565",
                "on-primary": "#ffffff",
                "primary-container": "#008080",
                "on-primary-container": "#e3fffe",
                "secondary": "#115cb9",
                "on-secondary": "#ffffff",
                "secondary-container": "#659dfe",
                "on-secondary-container": "#003370",
                "background": "#f9f9ff",
                "on-background": "#111c2c",
                "surface": "#f9f9ff",
                "on-surface": "#111c2c",
                "surface-variant": "#d8e3fa",
                "on-surface-variant": "#3e4949",
                "outline": "#6e7979",
                "outline-variant": "#bdc9c8",
                "error": "#ba1a1a",
                "on-error": "#ffffff",
                "error-container": "#ffdad6",
                "on-error-container": "#93000a",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f0f3ff",
                "surface-container": "#e7eeff",
                "surface-container-high": "#dee8ff",
                "surface-container-highest": "#d8e3fa",
                "primary-fixed": "#93f2f2",
                "primary-fixed-dim": "#76d6d5",
                "on-primary-fixed": "#002020",
                "on-primary-fixed-variant": "#004f4f",
                "secondary-fixed": "#d7e2ff",
                "secondary-fixed-dim": "#acc7ff",
                "on-secondary-fixed": "#001a40",
                "on-secondary-fixed-variant": "#004491",
            },
            spacing: {
                "unit": "4px",
                "gutter": "16px",
                "touch-target-min": "48px",
                "margin-mobile": "20px",
                "stack-sm": "8px",
                "stack-md": "16px",
                "stack-lg": "24px"
            }
        },
    },
    plugins: [],
}