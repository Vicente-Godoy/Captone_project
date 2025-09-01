// const oracledb = require("oracledb");
// require("dotenv").config();

// // Formato homogéneo en filas: objetos {COLUMNA: valor}
// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// // async function getConnection() {
// //   return await oracledb.getConnection({
// //     user: process.env.DB_USER,
// //     password: process.env.DB_PASSWORD,
// //     connectString: process.env.DB_CONNECT, // p. ej. localhost/XEPDB1
// //   });
// // }
// async function getConnection() {
//   try {
//     const conn = await oracledb.getConnection({
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       connectString: process.env.DB_CONNECT, // ej: localhost/XEPDB1
//     });

//     console.log("✅ Conexión a Oracle establecida correctamente");
//     return conn;
//   } catch (err) {
//     console.error("❌ Error al conectar a Oracle:", err.message);
//     throw err; // re-lanza el error para que la ruta lo capture
//   }
// }
// module.exports = getConnection;

// backend/db.js
// backend/db.js
const oracledb = require("oracledb");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const walletDir = path.isAbsolute(process.env.DB_WALLET_DIR)
  ? process.env.DB_WALLET_DIR
  : path.resolve(__dirname, process.env.DB_WALLET_DIR);

// Logs de verificación
console.log("🔎 Wallet dir:", walletDir);
console.log(
  "   - cwallet.sso:",
  fs.existsSync(path.join(walletDir, "cwallet.sso"))
);
console.log(
  "   - ewallet.p12:",
  fs.existsSync(path.join(walletDir, "ewallet.p12"))
);
console.log(
  "   - tnsnames.ora:",
  fs.existsSync(path.join(walletDir, "tnsnames.ora"))
);
console.log(
  "   - sqlnet.ora  :",
  fs.existsSync(path.join(walletDir, "sqlnet.ora"))
);

async function getConnection() {
  try {
    const conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT, // descriptor completo
      walletLocation: walletDir, // carpeta del wallet
      walletPassword: process.env.DB_WALLET_PASSWORD, // <- la que pusiste al descargar
    });
    console.log("✅ Conexión ATP OK como", process.env.DB_USER);
    return conn;
  } catch (err) {
    console.error("❌ Error conectando a ATP:", err.message);
    // errores típicos:
    // - bad decrypt -> walletPassword incorrecta o wallet corrupto
    // - file open/ENOENT -> ruta del wallet mal o faltan archivos
    throw err;
  }
}

module.exports = getConnection;
