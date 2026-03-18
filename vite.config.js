import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWP = mode === 'wordpress';

  return {
    // For WordPress, we use a relative path or a specific plugin path.
    // Setting to './' allows it to work relative to the page it is embedded on, 
    // BUT only if all assets are in the same relative structure.
    base: isWP ? '' : './',
    plugins: [
      react(),
      qrcode(),
    ],
    build: {
      outDir: isWP ? 'wordpress-plugin/assets' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Keep these fixed to make WordPress plugin enqueueing easy
          entryFileNames: `index.js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`
        }
      }
    },
    server: {
      host: true,      // Telefondan erişim için zorunlu
      port: 5173,
      strictPort: true, // Portun değişmesini engeller; her zaman 5173
      open: true,
      proxy: {
        '/api/nobetci': {
          target: 'https://www.antalyaeo.org.tr',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/nobetci/, '/tr/nobetci-eczaneler')
        },
        '/api/haber': {
          target: 'https://www.haberantalya.com/rss',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/haber/, '')
        },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    },
  };
});

