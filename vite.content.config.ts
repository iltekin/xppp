import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite config for Content Script (standalone IIFE bundle)
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // keep popup and public files in dist
    lib: {
      entry: resolve(__dirname, 'src/content/index.tsx'),
      name: 'XProfilePicturePreviewContent',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
