import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/secretarias': 'http://localhost:3000',
      '/setores': 'http://localhost:3000',
      '/fornecedores': 'http://localhost:3000',
      '/processos': 'http://localhost:3000',
      '/modelos-fluxo': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
});
