import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer Excel
const excelPath = path.join(__dirname, 'public', 'Copia de Playas_Costa_Rica.xlsx.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Función para crear slug
function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Contar slugs
const slugCounts = {};
const slugRows = {};

data.forEach((row, index) => {
  const title = row['Nombre'] || row['Playa'] || row['Título'] || row['Titulo'] || row['name'] || row['title'] || row['PLAYA'] || row['NOMBRE'] || `Playa ${index + 1}`;
  const slug = createSlug(title);
  
  if (!slugCounts[slug]) {
    slugCounts[slug] = 0;
    slugRows[slug] = [];
  }
  slugCounts[slug]++;
  slugRows[slug].push({ row: index + 2, title, slug });
});

// Encontrar duplicados
const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1);

console.log(`📊 Análisis de duplicados\n`);
console.log(`Total de filas en Excel: ${data.length}`);
console.log(`Slugs únicos: ${Object.keys(slugCounts).length}`);
console.log(`Slugs duplicados: ${duplicates.length}\n`);

if (duplicates.length > 0) {
  console.log(`⚠️  PLAYAS CON NOMBRES DUPLICADOS (se sobrescribirán):\n`);
  duplicates.forEach(([slug, count]) => {
    console.log(`   "${slug}" aparece ${count} veces:`);
    slugRows[slug].forEach(({ row, title }) => {
      console.log(`      - Fila ${row}: "${title}"`);
    });
    console.log('');
  });
  
  const totalDuplicates = duplicates.reduce((sum, [, count]) => sum + count - 1, 0);
  console.log(`\n📈 Resumen:`);
  console.log(`   Total de archivos que se crearían: ${data.length}`);
  console.log(`   Archivos que se sobrescribirían: ${totalDuplicates}`);
  console.log(`   Archivos finales únicos: ${data.length - totalDuplicates}`);
} else {
  console.log('✅ No hay duplicados!');
}
