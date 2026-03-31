import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclure les assets statiques dans public/ du scan de dépendances
    entries: ['src/**/*.{jsx,tsx,js,ts}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
          helmet: ['react-helmet-async'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // esbuild est intégré à Vite — pas besoin d'installer terser
    minify: 'esbuild',
  },
})
