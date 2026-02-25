#!/usr/bin/env node
/**
 * Yerel ağ IP ve mobil erişim URL'sini yazdırır.
 * npm run dev (veya npm run dev:host) çalışırken telefonundan bu adrese bağlanabilirsin.
 * QR kod için: npm i -D qrcode-terminal && node scripts/show-network.js
 */
import os from 'os';

const port = 5173;
let networkUrl = '';

const ifaces = os.networkInterfaces();
for (const name of Object.keys(ifaces)) {
  for (const iface of ifaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      networkUrl = `http://${iface.address}:${port}`;
      break;
    }
  }
  if (networkUrl) break;
}

if (networkUrl) {
  console.log('\n  📱 Mobil erişim (aynı WiFi):');
  console.log('  ' + networkUrl);
  console.log('  (Önce "npm run dev" çalışıyor olmalı. Vite da terminalde "Network" satırında bu adresi gösterir.)\n');
  import('qrcode-terminal').then((q) => q.default?.generate(networkUrl, { small: true })).catch(() => {});
} else {
  console.log('\n  Yerel IP bulunamadı. "npm run dev" ile Vite terminalde "Network: http://..." satırını gösterecektir.\n');
}
