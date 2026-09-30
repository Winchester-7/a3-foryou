import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  build: {
    // three.js lands in the lazily-loaded Scene chunk; the setup screen stays light
    chunkSizeWarningLimit: 1500,
  },
});
