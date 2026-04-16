import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig(({ mode }) => {
  const isWP = mode === 'wordpress';

  return {
    base: isWP ? '' : './',
    plugins: [
      react(),
      qrcode(),
    ],
    optimizeDeps: {
      entries: ['index.html', 'SRC/**/*.{js,jsx}'],
      exclude: ['android', 'ios', 'wordpress-plugin'],
    },
    build: {
      outDir: isWP ? 'wordpress-plugin/assets' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('firebase/firestore')) return 'firebase-firestore';
            if (id.includes('firebase/auth')) return 'firebase-auth';
            if (id.includes('firebase/storage')) return 'firebase-storage';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'motion-vendor';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('lucide-react') || id.includes('qrcode.react')) return 'ui-vendor';

            return 'vendor';
          },
          entryFileNames: isWP ? `index.js` : `assets/[name]-[hash].js`,
          chunkFileNames: isWP ? `[name].js` : `assets/[name]-[hash].js`,
          assetFileNames: isWP ? `[name].[ext]` : `assets/[name]-[hash][extname]`
        }
      }
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
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