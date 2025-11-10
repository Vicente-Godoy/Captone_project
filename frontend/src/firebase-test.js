// Archivo de prueba para verificar configuración de Firebase
import { auth, db, storage } from './lib/firebaseClient';

console.log('=== TEST DE CONFIGURACIÓN FIREBASE ===');

console.log('Auth inicializado:', auth ? 'SÍ' : 'NO');
console.log('Firestore inicializado:', db ? 'SÍ' : 'NO');
console.log('Storage inicializado:', storage ? 'SÍ' : 'NO');

if (auth) {
  console.log('📊 Auth config:', {
    currentUser: auth.currentUser,
    app: auth.app.name
  });
}

console.log('=== FIN DEL TEST ===');

