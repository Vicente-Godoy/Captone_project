const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Carga segura de credenciales:
 * 1. PRIORIZAMOS serviceAccountKey.json (más confiable, no requiere parsing).
 * 2. Si no existe, usamos variables de entorno.
 */
const normalizePrivateKey = (key) => {
  if (!key || typeof key !== 'string') {
    return null;
  }
  // Normalizar: reemplazar \n escapados por saltos reales
  // También manejar casos donde ya hay saltos reales
  let normalized = key.replace(/\\n/g, '\n');
  // Asegurar que empiece y termine correctamente
  normalized = normalized.trim();
  // Validar formato básico
  if (!normalized.startsWith('-----BEGIN') || !normalized.includes('-----END')) {
    return null;
  }
  return normalized;
};

const buildServiceAccountFromEnv = () => {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    return null;
  }

  const normalizedKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (!normalizedKey) {
    console.warn('[Firebase] La clave privada en variables de entorno no tiene un formato válido. Se intentará usar serviceAccountKey.json si existe.');
    return null;
  }

  return {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: normalizedKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };
};

const resolveServiceAccount = () => {
  // PRIORIDAD 1: serviceAccountKey.json (más confiable)
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    try {
      // eslint-disable-next-line global-require
      const credential = require(serviceAccountPath);
      if (credential && credential.private_key) {
        console.log('[Firebase] Usando credenciales desde serviceAccountKey.json');
        return { credential, source: 'serviceAccountKey.json' };
      }
    } catch (error) {
      console.warn('[Firebase] Error leyendo serviceAccountKey.json:', error.message);
    }
  }

  // PRIORIDAD 2: Variables de entorno
  const fromEnv = buildServiceAccountFromEnv();
  if (fromEnv) {
    console.log('[Firebase] Usando credenciales desde variables de entorno');
    return { credential: fromEnv, source: 'env' };
  }

  throw new Error('Firebase Admin requiere credenciales. Agrega serviceAccountKey.json en backend/ o define variables FIREBASE_* en .env');
};

const diagnoseCredentialError = (source, credential, error) => {
  console.error('\n[Firebase] ============================================');
  console.error('[Firebase] ERROR: No se pudo inicializar Firebase Admin');
  console.error('[Firebase] ============================================');
  console.error(`[Firebase] Fuente utilizada: ${source}`);
  console.error(`[Firebase] Error: ${error?.message || 'Desconocido'}`);

  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  const jsonExists = fs.existsSync(serviceAccountPath);

  if (!credential) {
    console.error('\n[Firebase] No se encontró credential válida.');
  } else if (!credential.private_key) {
    console.error('\n[Firebase] La propiedad private_key no está definida en la credencial.');
  } else {
    const key = credential.private_key;
    const hasEscapedBreaks = key.includes('\\n');
    const hasRealBreaks = key.includes('\n');
    const startsCorrectly = key.trim().startsWith('-----BEGIN');
    const endsCorrectly = key.trim().includes('-----END');
    
    console.error('\n[Firebase] Diagnóstico de la clave privada:');
    console.error(`  - Longitud: ${key.length} caracteres`);
    console.error(`  - Contiene "\\n" (escapados): ${hasEscapedBreaks}`);
    console.error(`  - Contiene saltos de línea reales: ${hasRealBreaks}`);
    console.error(`  - Empieza con "-----BEGIN": ${startsCorrectly}`);
    console.error(`  - Contiene "-----END": ${endsCorrectly}`);
    
    if (!startsCorrectly || !endsCorrectly) {
      console.error('\n[Firebase] ⚠️  La clave privada está corrupta o incompleta.');
    }
  }

  console.error('\n[Firebase] ============================================');
  console.error('[Firebase] SOLUCIÓN RECOMENDADA:');
  console.error('[Firebase] ============================================');
  
  if (!jsonExists) {
    console.error('\n1. Descarga serviceAccountKey.json desde Firebase Console:');
    console.error('   - Ve a Firebase Console > Configuración del proyecto > Cuentas de servicio');
    console.error('   - Haz clic en "Generar nueva clave privada"');
    console.error(`   - Guarda el archivo como: ${serviceAccountPath}`);
    console.error('\n2. O corrige las variables en backend/.env:');
    console.error('   - Comenta o elimina todas las variables FIREBASE_*');
    console.error('   - O asegúrate de que FIREBASE_PRIVATE_KEY esté entre comillas dobles');
    console.error('   - Ejemplo: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  } else {
    console.error(`\n✅ El archivo ${serviceAccountPath} existe.`);
    console.error('   El código debería usarlo automáticamente.');
    console.error('   Si el error persiste, verifica que el archivo no esté corrupto.');
    console.error('   Descarga una nueva clave desde Firebase Console si es necesario.');
  }
  
  console.error('\n[Firebase] ============================================\n');
};

const { credential: serviceAccount, source: serviceSource } = resolveServiceAccount();

// Resolver el nombre del bucket: env > JSON > construir desde project_id
let storageBucket = process.env.FIREBASE_STORAGE_BUCKET || serviceAccount.storageBucket;
if (!storageBucket && serviceAccount.project_id) {
  storageBucket = `${serviceAccount.project_id}.appspot.com`;
  console.log(`[Firebase] Bucket no especificado, usando: ${storageBucket}`);
}

if (!storageBucket) {
  throw new Error('Firebase Storage bucket no especificado. Define FIREBASE_STORAGE_BUCKET en .env o asegúrate de que serviceAccountKey.json incluya storageBucket.');
}

let app;
try {
  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket
      });
} catch (error) {
  diagnoseCredentialError(serviceSource, serviceAccount, error);
  throw error;
}

const db = admin.firestore(app);
const auth = admin.auth(app);
const bucket = admin.storage(app).bucket(storageBucket);

module.exports = {
  db,
  auth,
  bucket
};
