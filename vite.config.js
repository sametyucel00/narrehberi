import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    qrcode(), // Dev server başlayınca terminale QR kod basar (mobil erişim)
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    open: true,
  },
})
