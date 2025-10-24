import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/bhc-widget.js',
      name: 'BHC',
      fileName: 'bhc-widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'bhc-widget.[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
