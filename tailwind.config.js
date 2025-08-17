/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass-primary': 'rgba(0, 122, 255, 0.8)',
        'glass-secondary': 'rgba(52, 199, 89, 0.8)',
        'glass-accent': 'rgba(255, 149, 0, 0.8)',
        'glass-bg': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
        'glass-bg-dark': 'rgba(0, 0, 0, 0.2)',
        'glass-border-dark': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}