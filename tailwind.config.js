
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
    // Opciones de transformación para una purga más eficiente
    transform: {
      js: (content) => content.replace(/tailwindcss/g, ''),
    },
    // Opciones de extracción
    options: {
      safelist: [
        // Clases que podrían no ser detectadas pero son necesarias
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
  darkMode: 'class', // Habilita dark mode con clase 'dark'
  theme: {
    extend: {
      // Optimizaciones de animación
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Optimizaciones de backdrop
      backdropBlur: {
        'xs': '2px',
      },
      // Colores optimizados para el proyecto
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
  // Optimizaciones adicionales
  corePlugins: {
    // Deshabilitar plugins no utilizados para reducir el tamaño
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
  // Configuración experimental para mejor rendimiento
  experimental: {
    optimizeUniversalDefaults: true,
  },
}

