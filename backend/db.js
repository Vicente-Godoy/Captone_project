const oracledb = require("oracledb");
require("dotenv").config();

// Formato homogéneo en filas: objetos {COLUMNA: valor}
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT // p. ej. localhost/XEPDB1
  });
}

module.exports = getConnection;
 