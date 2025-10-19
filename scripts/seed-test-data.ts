// scripts/seed-test-data.js
const path = require('path');
const { testData } = require(path.join(__dirname, '../lib/utils'));

async function runSeed() {
  console.log('🌱 Ejecutando seed de datos de prueba...');
  await testData();
  console.log('✨ Listo! Reinicia la app con pnpm dev para ver cambios.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});