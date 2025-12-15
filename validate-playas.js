import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playasDir = path.join(__dirname, 'src', 'content', 'playas');
const files = fs.readdirSync(playasDir).filter(f => f.endsWith('.md'));

const errors = [];
const warnings = [];

// Rangos válidos para Costa Rica
const VALID_LAT_MIN = 8.0;
const VALID_LAT_MAX = 11.5;
const VALID_LNG_MIN = -86.0;
const VALID_LNG_MAX = -82.0;
const VALID_PROVINCIAS = ['guanacaste', 'puntarenas', 'limon'];

files.forEach(file => {
  const filePath = path.join(playasDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extraer frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push({ file, issue: 'No tiene frontmatter válido' });
    return;
  }
  
  const frontmatter = frontmatterMatch[1];
  const data = {};
  
  // Parsear frontmatter
  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      data[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
  
  // Validaciones
  if (!data.title || data.title === 'undefined') {
    errors.push({ file, issue: 'Título faltante o inválido', data: data.title });
  }
  
  if (!data.provincia || !VALID_PROVINCIAS.includes(data.provincia)) {
    errors.push({ file, issue: `Provincia inválida: "${data.provincia}"`, data: data.provincia });
  }
  
  const lat = parseFloat(data.lat);
  if (isNaN(lat)) {
    errors.push({ file, issue: 'Latitud inválida o faltante', data: data.lat });
  } else if (lat < VALID_LAT_MIN || lat > VALID_LAT_MAX) {
    warnings.push({ file, issue: `Latitud fuera de rango de CR: ${lat}`, data: lat });
  }
  
  const lng = parseFloat(data.lng);
  if (isNaN(lng)) {
    errors.push({ file, issue: 'Longitud inválida o faltante', data: data.lng });
  } else if (lng < VALID_LNG_MIN || lng > VALID_LNG_MAX) {
    warnings.push({ file, issue: `Longitud fuera de rango de CR: ${lng}`, data: lng });
  }
  
  if (data.visitada === undefined) {
    warnings.push({ file, issue: 'Campo "visitada" faltante (se usará default: false)' });
  }
  
  // Verificar que la provincia coincida con las coordenadas (aproximado)
  if (lat && lng && data.provincia) {
    if (data.provincia === 'guanacaste' && (lat < 9.5 || lat > 11.5 || lng > -84.5)) {
      warnings.push({ file, issue: `Provincia "guanacaste" pero coordenadas parecen incorrectas (lat: ${lat}, lng: ${lng})` });
    }
    if (data.provincia === 'puntarenas' && (lat < 8.0 || lat > 10.5 || lng < -85.5 || lng > -83.0)) {
      warnings.push({ file, issue: `Provincia "puntarenas" pero coordenadas parecen incorrectas (lat: ${lat}, lng: ${lng})` });
    }
    if (data.provincia === 'limon' && (lat < 9.0 || lat > 10.5 || lng > -82.5)) {
      warnings.push({ file, issue: `Provincia "limon" pero coordenadas parecen incorrectas (lat: ${lat}, lng: ${lng})` });
    }
  }
});

console.log('🔍 Validación de archivos de playas\n');
console.log(`Total de archivos: ${files.length}\n`);

if (errors.length > 0) {
  console.log(`❌ ERRORES encontrados (${errors.length}):`);
  errors.forEach(err => {
    console.log(`   ${err.file}: ${err.issue}${err.data ? ` (valor: ${err.data})` : ''}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log(`⚠️  ADVERTENCIAS (${warnings.length}):`);
  warnings.forEach(warn => {
    console.log(`   ${warn.file}: ${warn.issue}`);
  });
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Todos los archivos están correctos!');
} else {
  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Archivos correctos: ${files.length - errors.length - warnings.length}`);
  console.log(`   ❌ Errores: ${errors.length}`);
  console.log(`   ⚠️  Advertencias: ${warnings.length}`);
}


