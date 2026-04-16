import os from 'node:os';

const interfaces = os.networkInterfaces();
const rows = [];

for (const [name, addresses] of Object.entries(interfaces)) {
  for (const address of addresses || []) {
    if (address.family !== 'IPv4' || address.internal) continue;
    rows.push({
      name,
      address: address.address,
      devUrl: `http://${address.address}:5173`,
      previewUrl: `http://${address.address}:4173`
    });
  }
}

if (rows.length === 0) {
  console.log('Yerel a\u011f adresi bulunamad\u0131.');
  process.exit(0);
}

console.log('Nar Rehberi a\u011f eri\u015fim adresleri:');
for (const row of rows) {
  console.log(`- ${row.name}: ${row.address}`);
  console.log(`  Geli\u015ftirme: ${row.devUrl}`);
  console.log(`  Preview: ${row.previewUrl}`);
}