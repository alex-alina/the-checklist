import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiUrl = env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    server: {
      port: 5173
    },
    define: {
      __VITE_API_BASE_URL__: apiUrl ? JSON.stringify(apiUrl) : 'undefined'
    }
  };
});
