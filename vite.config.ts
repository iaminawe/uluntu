import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5555, // Using a different port to avoid conflicts
    strictPort: false, // Allow fallback to other ports if occupied
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable source maps for debugging
    sourcemap: true,
    // Increase chunk warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React core libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-state': ['@reduxjs/toolkit', 'react-redux'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          // UI libraries
          'vendor-ui': ['framer-motion', '@heroicons/react', 'lucide-react'],
          // Editor
          'vendor-editor': ['novel'],
          // Utilities
          'vendor-utils': ['date-fns', 'uuid', 'slugify'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Form libraries
          'vendor-forms': ['react-select', 'react-datepicker'],
        },
        // Better chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || 'asset';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `[ext]/[name]-[hash][extname]`;
        },
      },
    },
  },
})
