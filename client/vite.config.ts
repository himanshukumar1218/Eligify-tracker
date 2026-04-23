import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), commonjs()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    include: ['../shared/constants/eligibilityConstants.js']
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/]
    }
  }
});
