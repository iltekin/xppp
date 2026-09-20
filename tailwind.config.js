/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        xblue: {
          DEFAULT: '#1d9bf0',
          hover: '#1a8cd8',
        },
        xgreen: '#00ba7c',
        xpink: '#f91880',
        xdark: {
          bg: '#000000',
          card: '#16181c',
          border: '#2f3336',
          text: '#e7e9ea',
          muted: '#71767b',
          hover: '#181818',
        },
        xdim: {
          bg: '#15202b',
          card: '#1e2732',
          border: '#38444d',
          text: '#f7f9f9',
          muted: '#8b98a5',
          hover: '#22303c',
        },
        xlight: {
          bg: '#ffffff',
          card: '#f7f9f9',
          border: '#eff3f4',
          text: '#0f1419',
          muted: '#536471',
          hover: '#e7e7e8',
        }
      },
      fontFamily: {
        chirp: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
