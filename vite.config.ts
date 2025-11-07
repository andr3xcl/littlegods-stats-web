import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react({
          // Optimizaciones de React para producción
          jsxRuntime: 'automatic',
          // Habilita Fast Refresh optimizado
          fastRefresh: !isProduction,
        }),
        // Plugin para visualizar el tamaño del bundle (solo en producción)
        isProduction && visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimizaciones de build
        target: 'esnext',
        minify: isProduction ? 'esbuild' : false,
        sourcemap: !isProduction,
        rollupOptions: {
          output: {
            // Optimización de chunks
            manualChunks: {
              // Separar vendor chunks
              vendor: ['react', 'react-dom'],
              ui: ['lucide-react'],
              // Chunk para utilidades
              utils: ['./utils/cache.js', './utils/watchdog.js'],
            },
            // Nombres de archivos optimizados
            chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
            entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
            assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
          },
        },
        // Optimizaciones adicionales
        cssCodeSplit: true,
        reportCompressedSize: false, // Deshabilitar para builds más rápidas
        chunkSizeWarningLimit: 1000,
      },
      // Optimizaciones de desarrollo
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
        exclude: ['@vite/client', '@vite/env'],
      },
      // Configuración de CSS
      css: {
        devSourcemap: !isProduction,
        modules: {
          localsConvention: 'camelCase',
        },
      },
      // Configuración de ESBuild (usado para minificación)
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
        legalComments: 'none',
      },
    };
});
