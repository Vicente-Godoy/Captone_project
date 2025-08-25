const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const getConnection = require("../db");

/**
 * Helpers
 */
function normBody(body = {}) {
  return {
    id_perfiles: body.id_perfiles ?? body.ID_PERFILES,
    id_tipo_habilidad: body.id_tipo_habilidad ?? body.ID_TIPO_HABILIDAD,
    nom_habilidades: body.nom_habilidades ?? body.NOM_HABILIDADES,
    nivel: body.nivel ?? body.NIVEL ?? null
  };
}

/**
 * POST /api/habilidades
 * Crea una habilidad asociada a un perfil y a un tipo de habilidad.
 * Body esperado: { id_perfiles, id_tipo_habilidad, nom_habilidades, nivel? }
 */
router.post("/", async (req, res) => {
  let conn;
  try {
    const { id_perfiles, id_tipo_habilidad, nom_habilidades, nivel } = normBody(req.body);

    // Validaciones mínimas
    if (!id_perfiles || !id_tipo_habilidad || !nom_habilidades) {
      return res
        .status(400)
        .json({ error: "id_perfiles, id_tipo_habilidad y nom_habilidades son obligatorios" });
    }

    conn = await getConnection();

    // Validar que exista el perfil
    const chkPerfil = await conn.execute(
      `SELECT 1 FROM PERFILES WHERE ID = :id`,
      { id: id_perfiles }
    );
    if (chkPerfil.rows.length === 0) {
      return res.status(400).json({ error: "El ID_PERFILES no existe" });
    }

    // Validar que exista el tipo (y que esté ACTIVO='S' si quieres restringir)
    const chkTipo = await conn.execute(
      `SELECT 1 FROM TIPO_HABILIDAD WHERE ID = :id AND ACTIVO = 'S'`,
      { id: id_tipo_habilidad }
    );
    if (chkTipo.rows.length === 0) {
      return res.status(400).json({ error: "ID_TIPO_HABILIDAD no existe o está inactivo" });
    }

    // Insert con RETURNING
    const result = await conn.execute(
      `INSERT INTO HABILIDADES (ID_PERFILES, ID_TIPO_HABILIDAD, NOM_HABILIDADES, NIVEL)
       VALUES (:id_perfiles, :id_tipo_habilidad, :nom_habilidades, :nivel)
       RETURNING ID INTO :out_id`,
      {
        id_perfiles,
        id_tipo_habilidad,
        nom_habilidades,
        nivel,
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      message: "Habilidad creada correctamente",
      id: result.outBinds.out_id[0],
      data: { id_perfiles, id_tipo_habilidad, nom_habilidades, nivel }
    });
  } catch (err) {
    console.error("POST /habilidades error:", err);
    if (err.errorNum === 2291) {
      // violación de FK
      return res.status(400).json({ error: "FK inválida (perfil o tipo no existen)" });
    }
    if (err.errorNum === 1400) {
      return res.status(400).json({ error: "Campo obligatorio en NULL" });
    }
    return res.status(500).json({ error: "Fallo al crear habilidad" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

/**
 * GET /api/habilidades
 * Lista todas las habilidades
 */
router.get("/", async (_req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, ID_PERFILES, ID_TIPO_HABILIDAD, NOM_HABILIDADES, NIVEL
         FROM HABILIDADES
        ORDER BY ID`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /habilidades error:", err);
    return res.status(500).json({ error: "Fallo al listar habilidades" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

/**
 * GET /api/habilidades/perfil/:id_perfiles
 * Lista habilidades por perfil
 */
router.get("/perfil/:id_perfiles", async (req, res) => {
  let conn;
  try {
    const { id_perfiles } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, ID_PERFILES, ID_TIPO_HABILIDAD, NOM_HABILIDADES, NIVEL
         FROM HABILIDADES
        WHERE ID_PERFILES = :id_perfiles
        ORDER BY ID`,
      { id_perfiles }
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /habilidades/perfil error:", err);
    return res.status(500).json({ error: "Fallo al listar por perfil" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

/**
 * GET /api/habilidades/tipo/:id_tipo_habilidad
 * Lista habilidades por tipo de habilidad
 */
router.get("/tipo/:id_tipo_habilidad", async (req, res) => {
  let conn;
  try {
    const { id_tipo_habilidad } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID, ID_PERFILES, ID_TIPO_HABILIDAD, NOM_HABILIDADES, NIVEL
         FROM HABILIDADES
        WHERE ID_TIPO_HABILIDAD = :id_tipo_habilidad
        ORDER BY ID`,
      { id_tipo_habilidad }
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /habilidades/tipo error:", err);
    return res.status(500).json({ error: "Fallo al listar por tipo" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

/**
 * PUT /api/habilidades/:id
 * Actualiza una habilidad (nombre/nivel y opcionalmente reasigna tipo)
 * Body permitido: { nom_habilidades?, nivel?, id_tipo_habilidad? }
 */
router.put("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { nom_habilidades, nivel, id_tipo_habilidad } = normBody(req.body);

    if (!nom_habilidades && !nivel && !id_tipo_habilidad) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    conn = await getConnection();

    // Si quieren cambiar el tipo, validar que exista y esté activo
    if (id_tipo_habilidad) {
      const chkTipo = await conn.execute(
        `SELECT 1 FROM TIPO_HABILIDAD WHERE ID = :id AND ACTIVO = 'S'`,
        { id: id_tipo_habilidad }
      );
      if (chkTipo.rows.length === 0) {
        return res.status(400).json({ error: "ID_TIPO_HABILIDAD no existe o está inactivo" });
      }
    }

    // Construcción dinámica del UPDATE
    const sets = [];
    const binds = { id };

    if (typeof nom_habilidades !== "undefined") {
      sets.push(`NOM_HABILIDADES = :nom_habilidades`);
      binds.nom_habilidades = nom_habilidades;
    }
    if (typeof nivel !== "undefined") {
      sets.push(`NIVEL = :nivel`);
      binds.nivel = nivel;
    }
    if (typeof id_tipo_habilidad !== "undefined") {
      sets.push(`ID_TIPO_HABILIDAD = :id_tipo_habilidad`);
      binds.id_tipo_habilidad = id_tipo_habilidad;
    }

    const sql = `
      UPDATE HABILIDADES
         SET ${sets.join(", ")}
       WHERE ID = :id
    `;

    const result = await conn.execute(sql, binds, { autoCommit: true });
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Habilidad no encontrada" });
    }
    return res.json({ message: "Habilidad actualizada correctamente" });
  } catch (err) {
    console.error("PUT /habilidades/:id error:", err);
    if (err.errorNum === 2291) {
      return res.status(400).json({ error: "FK inválida: tipo no existe" });
    }
    return res.status(500).json({ error: "Fallo al actualizar" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

/**
 * DELETE /api/habilidades/:id
 * Elimina una habilidad
 */
router.delete("/:id", async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await getConnection();
    const result = await conn.execute(
      `DELETE FROM HABILIDADES WHERE ID = :id`,
      { id },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Habilidad no encontrada" });
    }
    return res.json({ message: "Habilidad eliminada correctamente" });
  } catch (err) {
    console.error("DELETE /habilidades/:id error:", err);
    return res.status(500).json({ error: "Fallo al eliminar" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }

  // GET /api/habilidades/detalle
router.get("/detalle", async (_req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT  h.ID,
               h.NOM_HABILIDADES,
               h.NIVEL,
               h.ID_PERFILES,
               p.NOMBRE  AS PERFIL_NOMBRE,
               p.EMAIL   AS PERFIL_EMAIL,
               h.ID_TIPO_HABILIDAD,
               t.NOMBRE  AS TIPO_NOMBRE
         FROM HABILIDADES h
         JOIN PERFILES p ON p.ID = h.ID_PERFILES
         JOIN TIPO_HABILIDAD t ON t.ID = h.ID_TIPO_HABILIDAD
        ORDER BY h.ID`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("GET /habilidades/detalle error:", err);
    return res.status(500).json({ error: "Fallo al listar detalle" });
  } finally {
    try { if (conn) await conn.close(); } catch {}
  }
});

});

module.exports = router;
