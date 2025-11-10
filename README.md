# SkillSwap

Aplicación de intercambio de habilidades entre usuarios.

## Documentación 
- https://github.com/Vicente-Godoy/Capstone_Doc.git

## Stack Tecnológico
- **Frontend**: React
- **Backend**: Node.js/Express
- **Base de datos**: Oracle XE

## Requisitos
- Node.js (>=18) y npm
- Oracle XE en local (con usuario dedicado, ej. bd_skillSwapApp)
- Git para control de versiones

## Instalación

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Librerías Instaladas

### Backend
- **express**: framework para servidor y API REST
- **oracledb**: driver oficial Oracle para Node.js
- **cors**: habilitar comunicación con frontend
- **nodemon (dev)**: reinicio automático en desarrollo
- **firebase-admin**: administración de Auth, Firestore y Storage
- **eslint/mocha (dev)**: linting y pruebas automáticas

### Frontend
- **react**: librería base
- **react-dom**: renderizado en navegador
- **react-scripts**: scripts CRA (start, build, test)
- El frontend usa fetch (nativo de JS), no fue necesario instalar Axios.

## Endpoints Clave
- **Usuarios**: `/api/users/me` (GET/PUT) para sincronizar perfil Firebase con Firestore
- **Publicaciones**: `/api/publications` (GET público con paginación `?limit&cursor` / POST autenticado) para gestionar el feed
- **Interacciones**: `/api/interactions/like` y `/api/interactions/matches` para likes y matches
- **Calendario**: `/api/calendar/events/*` para propuestas de reuniones
- **Storage**: `/api/storage/signed-uploads` genera URLs firmadas para subir imágenes

## Storage
- Subidas directas a Firebase Storage mediante URLs firmadas (carpetas `posts/` y `avatars/`)
- Bucket privado con reglas que limitan uploads a propietarios autenticados y archivos <5MB (JPG/PNG/WEBP)
- El backend agrega metadatos de propietario y caduca las URLs firmadas en minutos

## Seguridad Aplicada
- Autenticación basada en Firebase ID Tokens (verificados en backend)
- Variables sensibles en .env (excluido en .gitignore)
- CORS controlado por entorno
- Middlewares de protección: helmet, rate limiting y compresión HTTP

## Quality & CI
- Linter backend: `npm run lint` (en `backend/`)
- Pruebas backend: `npm test` (lint + Mocha)
- Linter frontend: `npm run lint` (en `frontend/`)
- Pruebas frontend: `npm test -- --watchAll=false`
- Workflows GitHub Actions (`.github/workflows/*`) ejecutan lint/tests en cada push y PR

## Troubleshooting
- Error al crear publicación → revisar token Firebase en `Authorization: Bearer`
- Fallo en subida de imágenes → validar configuraciones de Firebase Storage y URL firmada vigente
- Repo vacío → asegurarse de no tener `.git/` dentro de `backend/` o `frontend/` (evita submódulos)

## Nota
Este proyecto es parte de un trabajo académico. No subir datos sensibles ni credenciales reales al repositorio.
