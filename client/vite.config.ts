import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The API server (Express) in dev. Everything the browser needs — the JSON API
// and the /uploads static files — is proxied through the Vite origin so the app
// is fully same-origin in dev, exactly like it is in production where Express
// serves the built client itself.
const API_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:5001';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/uploads': { target: API_TARGET, changeOrigin: true },
    },
  },
});
