/**
 * Script de diagnóstico para verificar las credenciales de Firebase
 * Ejecutar: node scripts/check-firebase-credentials.js
 */

const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('Diagnóstico de Credenciales Firebase');
console.log('========================================\n');

// Verificar serviceAccountKey.json
const jsonPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const jsonExists = fs.existsSync(jsonPath);

console.log('1. Verificando serviceAccountKey.json:');
if (jsonExists) {
  try {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log('   ✅ Archivo existe');
    console.log(`   - project_id: ${jsonContent.project_id || 'NO DEFINIDO'}`);
    console.log(`   - client_email: ${jsonContent.client_email || 'NO DEFINIDO'}`);
    
    if (jsonContent.private_key) {
      const key = jsonContent.private_key;
      const hasRealBreaks = key.includes('\n');
      const startsCorrectly = key.trim().startsWith('-----BEGIN');
      const endsCorrectly = key.trim().includes('-----END');
      
      console.log(`   - private_key: ${key.length} caracteres`);
      console.log(`   - Formato válido: ${startsCorrectly && endsCorrectly ? '✅' : '❌'}`);
      console.log(`   - Tiene saltos de línea: ${hasRealBreaks ? '✅' : '❌'}`);
      
      if (!startsCorrectly || !endsCorrectly) {
        console.log('   ⚠️  ADVERTENCIA: La clave privada parece estar corrupta');
      }
    } else {
      console.log('   ❌ private_key: NO DEFINIDA');
    }
  } catch (error) {
    console.log(`   ❌ Error leyendo archivo: ${error.message}`);
  }
} else {
  console.log('   ❌ Archivo NO existe');
  console.log(`   Ruta esperada: ${jsonPath}`);
}

// Verificar variables de entorno
console.log('\n2. Verificando variables de entorno (.env):');
const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
const missing = required.filter(key => !process.env[key]);
const present = required.filter(key => process.env[key]);

if (present.length > 0) {
  console.log(`   ⚠️  Variables definidas: ${present.length}/${required.length}`);
  present.forEach(key => {
    const value = process.env[key];
    if (key === 'FIREBASE_PRIVATE_KEY') {
      const hasEscaped = value.includes('\\n');
      const hasReal = value.includes('\n');
      const startsCorrectly = value.trim().startsWith('-----BEGIN');
      const endsCorrectly = value.trim().includes('-----END');
      
      console.log(`   - ${key}: ${value.length} caracteres`);
      console.log(`     Formato válido: ${startsCorrectly && endsCorrectly ? '✅' : '❌'}`);
      console.log(`     Tiene \\n escapados: ${hasEscaped ? '✅' : '❌'}`);
      console.log(`     Tiene saltos reales: ${hasReal ? '⚠️  (puede causar problemas)' : '✅'}`);
      
      if (!startsCorrectly || !endsCorrectly) {
        console.log(`     ⚠️  ADVERTENCIA: La clave parece estar corrupta`);
      }
    } else {
      console.log(`   - ${key}: ${value ? '✅' : '❌'}`);
    }
  });
}

if (missing.length > 0) {
  console.log(`   ✅ Variables faltantes (OK si usas serviceAccountKey.json): ${missing.join(', ')}`);
}

// Recomendación
console.log('\n========================================');
console.log('Recomendación:');
console.log('========================================\n');

if (jsonExists) {
  console.log('✅ Usa serviceAccountKey.json (ya existe)');
  console.log('   El código lo usará automáticamente.');
  console.log('   Si hay errores, descarga una nueva clave desde Firebase Console.\n');
} else if (present.length === required.length) {
  console.log('⚠️  Solo variables de entorno disponibles');
  console.log('   Recomendación: Descarga serviceAccountKey.json desde Firebase Console');
  console.log('   para evitar problemas de formato con la clave privada.\n');
} else {
  console.log('❌ No hay credenciales válidas');
  console.log('   1. Descarga serviceAccountKey.json desde Firebase Console');
  console.log('   2. O define todas las variables FIREBASE_* en backend/.env\n');
}

console.log('========================================\n');


