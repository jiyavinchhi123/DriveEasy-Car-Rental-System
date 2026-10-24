import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for DriveEasy React Frontend
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  }
});
