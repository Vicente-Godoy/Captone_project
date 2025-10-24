const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// Habilita CORS controlado por entorno (en dev, refleja origen; en prod, set CORS_ORIGIN)
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
};
app.use(cors(corsOptions));
// Parsea los cuerpos de las peticiones entrantes con formato JSON
app.use(express.json());

// --- Carga de Rutas ---
// Se importa los módulos que definen los endpoints de la API.
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const publicationsRoutes = require('./routes/publicationsRoutes');
const interactionsRoutes = require('./routes/interactionsRoutes');

// --- Registro de Endpoints ---
// Asocia cada módulo de rutas con su prefijo de URL base.
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/publications", publicationsRoutes);
app.use("/api/interactions", interactionsRoutes);

// --- Ruta de Verificación de Salud ---
// Un endpoint simple para confirmar que el servidor está en línea.
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --- Inicio del Servidor ---
// Pone al servidor a escuchar peticiones en el puerto especificado.
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

