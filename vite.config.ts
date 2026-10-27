import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { adminSync } from './vite-plugins/adminSync';

export default defineConfig({
  plugins: [react(), tailwindcss(), adminSync()],
  server: { port: 5173, host: true },
});
