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
          
          jsxRuntime: 'automatic',
          
          fastRefresh: !isProduction,
        }),
        
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
        
        target: 'esnext',
        minify: isProduction ? 'esbuild' : false,
        sourcemap: !isProduction,
        rollupOptions: {
          output: {
            
            manualChunks: {
              
              vendor: ['react', 'react-dom'],
              ui: ['lucide-react'],
              
              utils: ['./utils/cache.js', './utils/watchdog.js'],
            },
            
            chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
            entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
            assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
          },
        },
        
        cssCodeSplit: true,
        reportCompressedSize: false, 
        chunkSizeWarningLimit: 1000,
      },
      
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
        exclude: ['@vite/client', '@vite/env'],
      },
      
      css: {
        devSourcemap: !isProduction,
        modules: {
          localsConvention: 'camelCase',
        },
      },
      
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
        legalComments: 'none',
      },
    };
});
