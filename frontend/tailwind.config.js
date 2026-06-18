/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#3B82F6',
            dark: '#2563EB',
            light: '#DBEAFE',
          },
          teal: {
            DEFAULT: '#14B8A6',
            dark: '#0EA5A4',
            light: '#CCFBF1',
          },
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        status: {
          open: '#3B82F6',
          inprogress: '#F59E0B',
          resolved: '#22C55E',
          closed: '#64748B',
          critical: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 8px -1px rgba(0, 0, 0, 0.02)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        input: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
