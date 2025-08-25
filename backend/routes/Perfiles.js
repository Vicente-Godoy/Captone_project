const express = require("express");
const router = express.Router();
const getConnection = require("../db");

// LISTAR todos los perfiles
router.get("/", async (_req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`SELECT * FROM PERFILES ORDER BY ID`);
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /perfiles error:", err);
    return res.status(500).json({ error: "Fallo al listar perfiles" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// OBTENER un perfil por ID
router.get("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(`SELECT * FROM PERFILES WHERE ID = :id`, { id });
    if (result.rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /perfiles/:id error:", err);
    return res.status(500).json({ error: "Fallo al obtener perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// CREAR perfil
router.post("/", async (req, res) => {
  let conn;
  try {
    const body = req.body || {};
    const nombre = body.nombre ?? body.NOMBRE;
    const email = body.email ?? body.EMAIL;
    const contrasena = body.contrasena ?? body.CONTRASENA;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: "nombre, email y contrasena son obligatorios" });
    }

    conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO PERFILES (NOMBRE, EMAIL, CONTRASENA)
       VALUES (:nombre, :email, :contrasena)
       RETURNING ID INTO :out_id`,
      {
        nombre, email, contrasena,
        out_id: { dir: require("oracledb").BIND_OUT, type: require("oracledb").NUMBER }
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      message: "Perfil creado correctamente",
      id: result.outBinds.out_id[0]
    });
  } catch (err) {
    console.error("POST /perfiles error:", err);
    if (err.errorNum === 1) return res.status(400).json({ error: "Email ya existe" });
    return res.status(500).json({ error: "Fallo al crear perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// ACTUALIZAR perfil
router.put("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const body = req.body || {};
    const nombre = body.nombre ?? body.NOMBRE;
    const email = body.email ?? body.EMAIL;
    const contrasena = body.contrasena ?? body.CONTRASENA;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: "nombre, email y contrasena son obligatorios" });
    }

    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE PERFILES
         SET NOMBRE = :nombre, EMAIL = :email, CONTRASENA = :contrasena
       WHERE ID = :id`,
      { nombre, email, contrasena, id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    return res.json({ message: "Perfil actualizado correctamente" });
  } catch (err) {
    console.error("PUT /perfiles/:id error:", err);
    return res.status(500).json({ error: "Fallo al actualizar perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// ELIMINAR perfil
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
    return res.json({ message: "Perfil eliminado correctamente" });
  } catch (err) {
    console.error("DELETE /perfiles/:id error:", err);
    return res.status(500).json({ error: "Fallo al eliminar perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

module.exports = router;
