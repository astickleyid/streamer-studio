import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.TWITCH_CLIENT_ID': JSON.stringify(env.TWITCH_CLIENT_ID),
        'process.env.TWITCH_CLIENT_SECRET': JSON.stringify(env.TWITCH_CLIENT_SECRET),
        'process.env.TWITCH_REDIRECT_URI': JSON.stringify(env.TWITCH_REDIRECT_URI)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'lucide': ['lucide-react'],
              'gemini': ['@google/genai']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      }
    };
});
