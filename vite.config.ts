import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { UserConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig((): UserConfig => ({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        }
      }
    })
  ],
  server: {
    port: 5555, // Using a different port to avoid conflicts
    strictPort: false, // Allow fallback to other ports if occupied
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    // Entries to force include in optimization
    entries: [
      './src/main.tsx'
    ],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
    // Optimization settings
    esbuildOptions: {
      target: 'es2020',
      keepNames: true
    },
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : true,
    // Increase chunk warning limit for large vendor chunks
    chunkSizeWarningLimit: 1500,
    // Minify settings
    minify: 'esbuild',
    cssMinify: 'esbuild',
    // Target modern browsers for better optimization
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Output directory
    outDir: 'dist',
    // Clear output directory before build
    emptyOutDir: true,
    // CSS code splitting
    cssCodeSplit: true,
    // Assets handling
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split vendor chunks by library group for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core — always needed
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/') || id.includes('/scheduler/')) {
              return 'vendor-react';
            }
            // State management
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('@tanstack/react-query')) {
              return 'vendor-state';
            }
            // Supabase
            if (id.includes('@supabase/')) {
              return 'vendor-supabase';
            }
            // Rich text editors (heavy — lazy-loaded pages pull these on demand)
            if (id.includes('@blocknote/') || id.includes('@tiptap/') || id.includes('/novel/') || id.includes('tiptap-extension')) {
              return 'vendor-editor';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }
            // Calendar / date
            if (id.includes('react-big-calendar') || id.includes('/moment/')) {
              return 'vendor-calendar';
            }
            // Animation
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // AI SDKs (heavy, admin-only)
            if (id.includes('@ai-sdk/') || id.includes('/ai/')) {
              return 'vendor-ai';
            }
            // Radix UI + headlessui (UI primitives)
            if (id.includes('@radix-ui/') || id.includes('@headlessui/')) {
              return 'vendor-ui';
            }
            // Everything else in node_modules → vendor
            return 'vendor';
          }
        },
        // Optimized chunk and asset naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || 'asset';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return `fonts/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      // Tree shaking enabled — reduces dead code from vendor packages
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    // Esbuild options for better minification
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      legalComments: 'none',
      treeShaking: true
    }
  },
  // Define environment variables
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version)
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  // JSON handling
  json: {
    namedExports: true,
    stringify: false
  }
}))
