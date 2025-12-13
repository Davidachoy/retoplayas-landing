import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo Excel
const excelPath = path.join(__dirname, 'public', 'Copia de Playas_Costa_Rica.xlsx.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Directorio de destino
const outputDir = path.join(__dirname, 'src', 'content', 'playas');

// Asegurar que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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

// Función para normalizar provincia
function normalizeProvincia(provincia) {
  if (!provincia) return 'guanacaste';
  const prov = provincia.toString().toLowerCase().trim();
  if (prov.includes('guanacaste')) return 'guanacaste';
  if (prov.includes('puntarenas')) return 'puntarenas';
  if (prov.includes('limon') || prov.includes('limón')) return 'limon';
  return 'guanacaste';
}

// Procesar cada fila
let created = 0;
let errors = 0;
const errorDetails = [];
const usedSlugs = {}; // Para rastrear slugs usados y evitar duplicados

console.log('📊 Procesando Excel...\n');
console.log(`Total de filas en Excel: ${data.length}\n`);
console.log('Columnas disponibles:', Object.keys(data[0] || {}).join(', '), '\n');

data.forEach((row, index) => {
  try {
    // Mapear columnas - intentar diferentes nombres posibles
    const title = row['Nombre'] || row['Playa'] || row['Título'] || row['Titulo'] || row['name'] || row['title'] || row['PLAYA'] || row['NOMBRE'] || `Playa ${index + 1}`;
    const provincia = normalizeProvincia(row['Provincia'] || row['provincia'] || row['Province'] || row['PROVINCIA']);
    
    // Intentar múltiples formatos para lat/lng
    let lat = parseFloat(row['Latitud'] || row['lat'] || row['Lat'] || row['latitude'] || row['LATITUD'] || row['LAT']);
    let lng = parseFloat(row['Longitud'] || row['lng'] || row['Lng'] || row['Lon'] || row['longitude'] || row['Long'] || row['LONGITUD'] || row['LNG']);
    
    // Si no se encontró, intentar con otros nombres comunes
    if (isNaN(lat)) {
      lat = parseFloat(row['Latitude'] || row['LATITUDE']);
    }
    if (isNaN(lng)) {
      lng = parseFloat(row['Longitude'] || row['LONGITUDE'] || row['LON']);
    }
    
    const description = row['Descripción'] || row['description'] || row['Desc'] || row['desc'] || row['DESCRIPCIÓN'] || row['DESCRIPCION'] || '';
    const visitada = row['Visitada'] === true || row['visitada'] === true || row['Visitada'] === 'Sí' || row['Visitada'] === 'Sí' || row['Visitada'] === 'Si' || row['Visitada'] === 'si' || row['Visitada'] === 1 || row['VISITADA'] === true || row['VISITADA'] === 'Sí';
    const date = row['Fecha'] || row['date'] || row['Date'] || row['FECHA'] || null;
    const image = row['Imagen'] || row['image'] || row['Foto'] || row['foto'] || row['IMAGEN'] || '';
    const link = row['Link'] || row['link'] || row['URL'] || row['url'] || row['LINK'] || '';

    // Validar campos requeridos
    const missingFields = [];
    if (!title || title === `Playa ${index + 1}`) missingFields.push('title');
    if (isNaN(lat) || lat === 0) missingFields.push('lat');
    if (isNaN(lng) || lng === 0) missingFields.push('lng');
    
    if (missingFields.length > 0) {
      const errorMsg = `Fila ${index + 2}: Faltan campos - ${missingFields.join(', ')} | Title: "${title}", Lat: ${lat}, Lng: ${lng}`;
      console.log(`⚠️  ${errorMsg}`);
      errorDetails.push({
        row: index + 2,
        title: title,
        lat: lat,
        lng: lng,
        missing: missingFields,
        rawRow: row
      });
      errors++;
      return;
    }

    // Crear slug usando el nombre + número de fila del Excel
    // Esto permite que playas con el mismo nombre coexistan
    const baseSlug = createSlug(title);
    const rowNumber = index + 1; // Número de fila (empezando en 1)
    const slug = `${baseSlug}-${rowNumber}`;

    // Crear contenido del archivo MD
    let frontmatter = `---
title: "${title.toString().replace(/"/g, '\\"')}"
provincia: "${provincia}"
visitada: ${visitada}`;

    if (date) {
      // Intentar parsear la fecha
      let dateStr = date;
      if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
      } else if (typeof date === 'number') {
        // Excel date serial number
        const excelEpoch = new Date(1899, 11, 30);
        const excelDate = new Date(excelEpoch.getTime() + date * 86400000);
        dateStr = excelDate.toISOString().split('T')[0];
      }
      frontmatter += `\ndate: ${dateStr}`;
    }

    frontmatter += `\nlat: ${lat}
lng: ${lng}`;

    if (image) {
      frontmatter += `\nimage: "${image.toString().replace(/"/g, '\\"')}"`;
    }

    if (description) {
      frontmatter += `\ndescription: "${description.toString().replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
    }

    if (link) {
      frontmatter += `\nlink: "${link.toString().replace(/"/g, '\\"')}"`;
    }

    frontmatter += '\n---\n';

    // Escribir archivo
    const filePath = path.join(outputDir, `${slug}.md`);
    fs.writeFileSync(filePath, frontmatter, 'utf-8');
    created++;
    console.log(`✅ [${index + 2}] Creado: ${slug}.md - ${title}`);
  } catch (error) {
    console.error(`❌ Error en fila ${index + 2}:`, error.message);
    errors++;
  }
});

console.log(`\n✨ Proceso completado:`);
console.log(`   ✅ Archivos creados: ${created}`);
console.log(`   ❌ Errores: ${errors}`);
console.log(`   📊 Total procesado: ${data.length}`);
console.log(`   📈 Diferencia: ${data.length - created - errors} filas no procesadas`);
console.log(`\n📁 Archivos guardados en: ${outputDir}`);

if (errorDetails.length > 0) {
  console.log(`\n📋 Detalle de errores (${errorDetails.length} filas):`);
  errorDetails.forEach(err => {
    console.log(`   Fila ${err.row}: ${err.title || 'Sin título'} - Faltan: ${err.missing.join(', ')}`);
    console.log(`      Columnas disponibles: ${Object.keys(err.rawRow).join(', ')}`);
  });
  
  // Guardar reporte de errores
  const reportPath = path.join(__dirname, 'playas-errors-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(errorDetails, null, 2), 'utf-8');
  console.log(`\n📄 Reporte de errores guardado en: ${reportPath}`);
}
