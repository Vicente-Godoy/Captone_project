const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const getConnection = require("../db");

// LISTAR tipos (solo activos por defecto)
router.get("/", async (req, res) => {
  let conn;
  try {
    const incluirInactivos = req.query.incluirInactivos === "true";
    conn = await getConnection();
    const sql = incluirInactivos
      ? `SELECT * FROM TIPO_HABILIDAD ORDER BY NOMBRE`
      : `SELECT * FROM TIPO_HABILIDAD WHERE ACTIVO='S' ORDER BY NOMBRE`;
    const result = await conn.execute(sql);
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /tipo-habilidad error:", err);
    return res.status(500).json({ error: "Fallo al listar tipos" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// CREAR tipo
router.post("/", async (req, res) => {
  let conn;
  try {
    const { nombre, descripcion, activo } = req.body || {};
    if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });

    conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO TIPO_HABILIDAD (NOMBRE, DESCRIPCION, ACTIVO)
       VALUES (:nombre, :descripcion, :activo)
       RETURNING ID INTO :out_id`,
      {
        nombre,
        descripcion: descripcion ?? null,
        activo: activo === "N" ? "N" : "S",
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    return res.status(201).json({ message: "Tipo creado", id: result.outBinds.out_id[0] });
  } catch (err) {
    console.error("POST /tipo-habilidad error:", err);
    if (err.errorNum === 1) return res.status(400).json({ error: "Nombre ya existe" });
    return res.status(500).json({ error: "Fallo al crear tipo" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// ACTUALIZAR tipo
router.put("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body || {};
    if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });

    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE TIPO_HABILIDAD
         SET NOMBRE = :nombre,
             DESCRIPCION = :descripcion,
             ACTIVO = :activo
       WHERE ID = :id`,
      {
        nombre,
        descripcion: descripcion ?? null,
        activo: activo === "N" ? "N" : "S",
        id
      },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: "Tipo no encontrado" });
    return res.json({ message: "Tipo actualizado" });
  } catch (err) {
    console.error("PUT /tipo-habilidad/:id error:", err);
    return res.status(500).json({ error: "Fallo al actualizar tipo" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

// (Opcional) ELIMINAR tipo — ojo si hay habilidades que lo usan
router.delete("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();

    // Verifica uso
    const uso = await conn.execute(
      `SELECT 1 FROM HABILIDADES WHERE ID_TIPO_HABILIDAD = :id FETCH FIRST 1 ROWS ONLY`,
      { id }
    );
    if (uso.rows.length > 0) {
      return res.status(409).json({ error: "No se puede eliminar: hay habilidades usando este tipo" });
    }

    const result = await conn.execute(
      `DELETE FROM TIPO_HABILIDAD WHERE ID = :id`,
      { id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: "Tipo no encontrado" });
    return res.json({ message: "Tipo eliminado" });
  } catch (err) {
    console.error("DELETE /tipo-habilidad/:id error:", err);
    return res.status(500).json({ error: "Fallo al eliminar tipo" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

module.exports = router;
