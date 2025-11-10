const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const REQUEST_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "1mb";
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100);

// --- Middlewares ---
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
  })
);

// Habilita CORS controlado por entorno (en dev, refleja origen; en prod, set CORS_ORIGIN)
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(compression());

// Limita payloads y mitiga ataques básicos
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: REQUEST_BODY_LIMIT }));

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta nuevamente más tarde." },
});
app.use("/api/", apiLimiter);

// --- Carga de Rutas ---
// Se importa los módulos que definen los endpoints de la API.
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const publicationsRoutes = require('./routes/publicationsRoutes');
const interactionsRoutes = require('./routes/interactionsRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const storageRoutes = require('./routes/storageRoutes');

// --- Registro de Endpoints ---
// Asocia cada módulo de rutas con su prefijo de URL base.
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/publications", publicationsRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/storage", storageRoutes);

// --- Ruta de Verificación de Salud ---
// Un endpoint simple para confirmar que el servidor está en línea.
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --- Manejo de Errores ---
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Manejar rutas no encontradas (debe ir después de todas las rutas)
app.use(notFoundHandler);

// Middleware de manejo de errores global (debe ir al final)
app.use(errorHandler);

// --- Inicio del Servidor ---
// Pone al servidor a escuchar peticiones en el puerto especificado.
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

