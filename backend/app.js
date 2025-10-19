const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Carga de Rutas (Endpoints) ---
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes'); // Importa las rutas de usuarios

// --- Registro de Rutas ---
// Rutas públicas de autenticación
app.use("/api/auth", authRoutes);
// Rutas de usuarios (contiene rutas públicas y privadas)
app.use("/api/users", usersRoutes); // Registra las rutas de usuarios


app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", message: "Servidor SkillSwap operativo." });
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

