// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/summoner': {
        target: 'http://localhost:8080', // 스프링
        changeOrigin: true,
        // /api 접두어 제거하고 백엔드로 전달
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/match' : {
        target: 'http://localhost:8080', // 스프링
        changeOrigin: true,
        // /api 접두어 제거하고 백엔드로 전달
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
  },
});