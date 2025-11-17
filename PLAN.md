# PLAN.md - Análisis y Fixes para SkillSwap

## 🔍 ANÁLISIS DEL REPOSITORIO

### 1. Inicialización de Firebase

**Backend (Admin SDK):**
- **Archivo:** `backend/config/firebase.js`
- **Inicialización:** Firebase Admin SDK con `serviceAccountKey.json`
- **Servicios:** `auth` (Authentication) y `db` (Firestore)
- **Storage:** No inicializado en backend

**Frontend (Client SDK):**
- **Archivo:** `frontend/src/lib/firebaseClient.js`
- **Inicialización:** Firebase Client SDK con variables de entorno
- **Servicios:** `auth` (Authentication) y `storage` (Storage)
- **Firestore:** No inicializado en frontend (solo se usa en backend)

### 2. Creación/Actualización de Usuarios `/users/{uid}`

**Flujo Actual:**
1. **Registro:** `frontend/src/components/registro/Registro.js` → `frontend/src/services/auth.js` → `registerUser()`
2. **Backend:** `backend/controllers/authController.js` → `register()` crea usuario en Firebase Auth + documento en `/users/{uid}`
3. **Login:** `frontend/src/components/login/Login.js` → `frontend/src/services/auth.js` → `loginWithPassword()`

**Problema Identificado:** 
- El frontend usa Firebase Client SDK para registro/login
- El backend usa Firebase Admin SDK para crear usuarios
- **DESCONEXIÓN:** El frontend no llama al backend para registro, solo usa Firebase Client SDK

### 3. Creación de Posts `/posts` y Listado en Home

**Creación de Posts:**
- **Frontend:** `frontend/src/services/publications.js` → `createPublication()` → llama a `backend/api/publications`
- **Backend:** `backend/controllers/publicationsController.js` → `createPublication()` → crea en colección `publications`
- **Middleware:** `backend/middleware/authMiddleware.js` verifica token Firebase

**Listado en Home:**
- **Frontend:** `frontend/src/components/pages/Home.js` → fetch a `backend/api/publications`
- **Backend:** `backend/controllers/publicationsController.js` → `getAllPublications()` → consulta `publications` donde `activo == true`

### 4. Hipótesis Concretas de Por Qué No Funciona

#### 🔴 **PROBLEMA PRINCIPAL: DESCONEXIÓN FRONTEND-BACKEND**

1. **Registro de Usuarios:**
   - Frontend usa Firebase Client SDK (`registerUser()`)
   - Backend tiene endpoint `/api/auth/register` que NO se usa
   - **Resultado:** Usuarios se crean en Firebase Auth pero NO en Firestore `/users/{uid}`

2. **Autenticación:**
   - Frontend usa Firebase Client SDK para login
   - Backend espera tokens Firebase ID para middleware
   - **Resultado:** Login funciona pero backend no puede verificar tokens

3. **Creación de Posts:**
   - Frontend llama a backend con token Firebase ID
   - Backend middleware verifica token pero puede fallar
   - **Resultado:** Posts no se crean o no se muestran

4. **Variables de Entorno:**
   - Frontend necesita `.env` con config Firebase
   - Backend necesita `serviceAccountKey.json`
   - **Resultado:** Posible falta de configuración

## 🛠️ PLAN DE FIXES MÍNIMOS

### **PASO 1: Verificar Configuración Firebase**
- [ ] Verificar que `frontend/.env` existe con variables Firebase
- [ ] Verificar que `backend/serviceAccountKey.json` existe y es válido
- [ ] Verificar que `backend/.env` existe con `JWT_SECRET`

### **PASO 2: Conectar Frontend con Backend para Registro**
- [ ] Modificar `frontend/src/services/auth.js` para llamar a `backend/api/auth/register`
- [ ] Asegurar que el backend crea documento en `/users/{uid}` tras registro
- [ ] Verificar que el token Firebase ID se genera correctamente

### **PASO 3: Verificar Middleware de Autenticación**
- [ ] Verificar que `backend/middleware/authMiddleware.js` funciona con tokens Firebase ID
- [ ] Añadir logs para debuggear verificación de tokens
- [ ] Verificar que `req.user` contiene `uid` correcto

### **PASO 4: Verificar Creación de Posts**
- [ ] Verificar que `frontend/src/services/publications.js` envía token correcto
- [ ] Verificar que `backend/controllers/publicationsController.js` crea posts en colección `publications`
- [ ] Verificar que posts se crean con `activo: true`

### **PASO 5: Verificar Listado en Home**
- [ ] Verificar que `frontend/src/components/pages/Home.js` llama a endpoint correcto
- [ ] Verificar que `backend/controllers/publicationsController.js` retorna posts con `activo: true`
- [ ] Verificar que consulta Firestore funciona correctamente

### **PASO 6: Añadir Logs y Debugging**
- [ ] Añadir `console.log` en frontend para verificar llamadas a API
- [ ] Añadir `console.log` en backend para verificar recepción de requests
- [ ] Añadir manejo de errores más detallado

### **PASO 7: Verificar Firestore Rules**
- [ ] Verificar que reglas de Firestore permiten lectura/escritura en `/users` y `/publications`
- [ ] Verificar que reglas permiten acceso autenticado

### **PASO 8: Testing End-to-End**
- [ ] Probar registro completo: frontend → backend → Firestore
- [ ] Probar login completo: frontend → backend → middleware
- [ ] Probar creación de post: frontend → backend → Firestore
- [ ] Probar listado en Home: frontend → backend → Firestore

## 🎯 PRIORIDADES

1. **CRÍTICO:** Conectar frontend con backend para registro
2. **CRÍTICO:** Verificar middleware de autenticación
3. **ALTO:** Verificar creación de posts
4. **ALTO:** Verificar listado en Home
5. **MEDIO:** Añadir logs y debugging
6. **BAJO:** Verificar Firestore rules

## 📝 NOTAS ADICIONALES

- El proyecto tiene **DOS sistemas de autenticación** (Firebase Client + Backend JWT)
- Necesita **unificación** en un solo flujo
- El backend está preparado para Firebase Admin SDK
- El frontend está preparado para Firebase Client SDK
- **Solución:** Usar Firebase Client SDK en frontend + Firebase Admin SDK en backend




