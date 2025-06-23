import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Performance monitoring build configuration
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // or 'sunburst', 'network'
    })
  ],
  server: {
    port: 5555,
    strictPort: false,
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
    reportCompressedSize: true,
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'vendor-state';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (id.includes('framer-motion') || id.includes('@heroicons/react') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          if (id.includes('novel') || id.includes('@tiptap')) {
            return 'vendor-editor';
          }
          if (id.includes('date-fns') || id.includes('uuid') || id.includes('slugify') || id.includes('zod')) {
            return 'vendor-utils';
          }
          if (id.includes('@supabase/supabase-js')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    }
  }
})