const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("1. Iniciando app.js...");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
console.log("2. Configurando middlewares (CORS, express.json)...");
app.use(cors());
app.use(express.json());
console.log("3. Middlewares configurados.");

// Rutas
console.log("4. Cargando archivos de rutas...");
try {
    const perfilesRoutes = require("./routes/Perfiles");
    const tipoHabilidadRoutes = require("./routes/TipoHabilidad");
    const habilidadesRoutes = require("./routes/Habilidades");
    const authRoutes = require("./routes/auth");

    console.log("5. Archivos de rutas cargados en memoria.");

    // Registro de endpoints
    app.use("/api/auth", authRoutes);
    app.use("/api/perfiles", perfilesRoutes);
    app.use("/api/tipo-habilidad", tipoHabilidadRoutes);
    app.use("/api/habilidades", habilidadesRoutes);

    console.log("Todas las rutas han sido registradas.");

} catch (error) {
    console.error("ERROR CRÍTICO al cargar las rutas:", error);
    process.exit(1); // Detiene el servidor si las rutas no cargan
}

// Ruta para verificar que el servidor está activo
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});