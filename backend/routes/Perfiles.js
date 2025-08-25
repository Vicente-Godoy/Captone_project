const express = require("express");
const router = express.Router();
const getConnection = require("../db");
const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");


const SALT_ROUNDS = 10;

// LISTAR (no exponemos CONTRASENA)
router.get("/", async (_req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, NOMBRE, EMAIL, CREATED_AT FROM PERFILES ORDER BY ID`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /perfiles error:", err);
    return res.status(500).json({ error: "Fallo al listar perfiles" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// OBTENER por ID (sin contraseña)
router.get("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, NOMBRE, EMAIL, CREATED_AT FROM PERFILES WHERE ID = :id`,
      { id }
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /perfiles/:id error:", err);
    return res.status(500).json({ error: "Fallo al obtener perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// CREAR (hashea contrasena)
router.post("/", async (req, res) => {
  let conn;
  try {
    const b = req.body || {};
    const nombre = b.nombre ?? b.NOMBRE;
    const email = b.email ?? b.EMAIL;
    const contrasena = b.contrasena ?? b.CONTRASENA;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: "nombre, email y contrasena son obligatorios" });
    }

    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO PERFILES (NOMBRE, EMAIL, CONTRASENA)
       VALUES (:nombre, :email, :hash)
       RETURNING ID INTO :out_id`,
      {
        nombre, email,
        hash,
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    return res.status(201).json({ message: "Perfil creado", id: result.outBinds.out_id[0] });
  } catch (err) {
    console.error("POST /perfiles error:", err);
    if (err.errorNum === 1) return res.status(400).json({ error: "Email ya existe" });
    return res.status(500).json({ error: "Fallo al crear perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// ACTUALIZAR (rehash si viene nueva contraseña)
router.put("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const b = req.body || {};
    const nombre = b.nombre ?? b.NOMBRE;
    const email = b.email ?? b.EMAIL;
    const contrasena = b.contrasena ?? b.CONTRASENA;

    if (!nombre || !email) {
      return res.status(400).json({ error: "nombre y email son obligatorios" });
    }

    conn = await getConnection();

    let sql = `UPDATE PERFILES SET NOMBRE=:nombre, EMAIL=:email`;
    const binds = { nombre, email, id };

    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
      sql += `, CONTRASENA=:hash`;
      binds.hash = hash;
    }
    sql += ` WHERE ID = :id`;

    const result = await conn.execute(sql, binds, { autoCommit: true });
    if (result.rowsAffected === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    return res.json({ message: "Perfil actualizado" });
  } catch (err) {
    console.error("PUT /perfiles/:id error:", err);
    return res.status(500).json({ error: "Fallo al actualizar perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `DELETE FROM PERFILES WHERE ID = :id`,
      { id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    return res.json({ message: "Perfil eliminado" });
  } catch (err) {
    console.error("DELETE /perfiles/:id error:", err);
    return res.status(500).json({ error: "Fallo al eliminar perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

module.exports = router;
