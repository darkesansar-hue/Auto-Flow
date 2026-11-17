/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // n8n signature brand tokens
        n8n: {
          coral: '#FF6D5A',
          coralHover: '#E05342',
          pink: '#EA4B71',
          bg: '#121214',
          canvas: '#151518',
          card: '#1B1B1F',
          cardHover: '#222228',
          border: '#2A2A32',
          borderHover: '#3F3F4E',
          accent: '#FF6D5A',
        },
        forge: {
          950: '#121214',
          900: '#18181B',
          850: '#1F1F24',
          800: '#26262D',
          700: '#32323D',
          600: '#484857',
          500: '#68687A',
          accent: '#FF6D5A',
          accentHover: '#E05342',
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#EF4444',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'n8n-glow': '0 0 24px -4px rgba(255, 109, 90, 0.35)',
        'glow-indigo': '0 0 24px -4px rgba(255, 109, 90, 0.35)',
        'node-card': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
};
