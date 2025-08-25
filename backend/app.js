const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const perfilesRoutes = require("./routes/Perfiles");
const habilidadesRoutes = require("./routes/Habilidades");
const tipoHabilidadRoutes = require("./routes/TipoHabilidad");

app.use("/api/perfiles", require("./routes/Perfiles"));
app.use("/api/tipo-habilidad", require("./routes/TipoHabilidad"));
app.use("/api/habilidades", require("./routes/Habilidades"));

// Salud
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
 