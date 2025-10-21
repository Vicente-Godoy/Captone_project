const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// Habilita CORS para permitir peticiones desde el frontend (localhost:3000)
app.use(cors());
// Parsea los cuerpos de las peticiones entrantes con formato JSON
app.use(express.json());

// --- Carga de Rutas ---
// Se importa los módulos que definen los endpoints de la API.
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const publicationsRoutes = require('./routes/publicationsRoutes');

// --- Registro de Endpoints ---
// Asocia cada módulo de rutas con su prefijo de URL base.
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/publications", publicationsRoutes);

// --- Ruta de Verificación de Salud ---
// Un endpoint simple para confirmar que el servidor está en línea.
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --- Inicio del Servidor ---
// Pone al servidor a escuchar peticiones en el puerto especificado.
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

