const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtener la instancia de Firestore
const db = admin.firestore();

// Exportamos la base de datos para usarla en otros archivos.
module.exports = { db };
