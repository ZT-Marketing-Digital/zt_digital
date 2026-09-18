import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Build estático (dist/) para publicar via FTP no cPanel.
  base: '/',
});
