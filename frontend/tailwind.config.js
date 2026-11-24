/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#faf8f5',
        'soft-paper': '#fdfbfa',
        'warm-mist': '#d1d1cd',
        ash: '#92918b',
        graphite: '#72706b',
        ink: '#27251e',
        'deep-teal': {
          DEFAULT: '#016a71',
          hover: '#01565c',
          light: '#e6f3f4',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#2ecc71',
          600: '#27ae60',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(39, 37, 30, 0.05), 0 1px 2px -1px rgba(39, 37, 30, 0.05)',
        card: '0 4px 12px -2px rgba(39, 37, 30, 0.05), 0 2px 6px -1px rgba(39, 37, 30, 0.03)',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        btn: '6px',
      },
    },
  },
  plugins: [],
};
