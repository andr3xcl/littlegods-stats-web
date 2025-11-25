
export default {
  content: {
    files: [
      "./index.html",
      "./src*.{js,ts,jsx,tsx}",
      ".*.{js,ts,jsx,tsx}",
      "./pages*.{js,ts,jsx,tsx}",
      "./contexts*.{js,ts,jsx,tsx}",
      "./utils*.{js,ts,jsx,tsx}",
      "./locales*.{js,ts,jsx,tsx}",
    ],
    
    transform: {
      js: (content) => content.replace(/tailwindcss/g, ''),
    },
    
    options: {
      safelist: [
        
        'dark',
        'group-hover',
        'hover',
        'focus',
        'active',
        'animate-pulse',
        'animate-spin',
      ],
    },
  },
  darkMode: 'class', 
  theme: {
    extend: {
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      backdropBlur: {
        'xs': '2px',
      },
      
      colors: {
        'brand-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
    },
  },
  plugins: [],
  
  corePlugins: {
    
    fontVariantNumeric: false,
    touchAction: false,
    ringOffsetWidth: false,
    ringOffsetColor: false,
    scrollSnapType: false,
    scrollSnapAlign: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    textOpacity: false,
    backgroundOpacity: false,
  },
  
  experimental: {
    optimizeUniversalDefaults: true,
  },
}

