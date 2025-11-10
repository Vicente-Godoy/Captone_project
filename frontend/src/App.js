// src/App.js
import React, { useEffect, useState, Fragment, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RegistroFlowProvider } from "./components/registro/RegistroFlow";
import { onAuthChange } from "./services/auth";

// Auth / registro
const Login = lazy(() => import("./components/login/Login"));
const Registro = lazy(() => import("./components/registro/Registro"));
const ConOfre = lazy(() => import("./components/registro/ConOfre"));
const Etiqueta1 = lazy(() => import("./components/registro/Etiqueta1"));
const Etiqueta2 = lazy(() => import("./components/registro/Etiqueta2"));
const Foto = lazy(() => import("./components/registro/Foto"));

// Páginas
const Home = lazy(() => import("./components/pages/Home"));
const Publicar = lazy(() => import("./components/pages/Publicar"));
const Likes = lazy(() => import("./components/pages/Likes"));
const Chat = lazy(() => import("./components/pages/Chat"));
const Profile = lazy(() => import("./components/pages/Profile"));
const BottomBar = lazy(() => import("./components/BottomBar"));

// Internas
const PerfilesList = lazy(() => import("./components/perfiles/PerfilesList"));
const PerfilesForm = lazy(() => import("./components/perfiles/PerfilesForm"));
const HabilidadesList = lazy(() => import("./components/habilidades/HabilidadesList"));
const HabilidadesForm = lazy(() => import("./components/habilidades/HabilidadesForm"));

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refrescar = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const unsub = onAuthChange((u) => setLoggedIn(!!u));
    return () => unsub?.();
  }, []);

  return (
    <Router>
      {/* Un solo provider para toda la app */}
      <RegistroFlowProvider>
        <div style={{ paddingBottom: loggedIn ? "90px" : 0 }}>
          <Suspense fallback={<div style={{ padding: "24px", textAlign: "center" }}>Cargando...</div>}>
            <Routes>
              {!loggedIn ? (
                <Fragment>
                  {/* Login por defecto */}
                  <Route path="/" element={<Login onLogin={setLoggedIn} />} />

                  {/* Wizard disponible también estando deslogueado */}
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/registro/ConOfre" element={<ConOfre />} />
                  <Route path="/registro/Etiqueta1" element={<Etiqueta1 />} />
                  <Route path="/registro/Etiqueta2" element={<Etiqueta2 />} />
                  <Route path="/registro/Foto" element={<Foto />} />

                  <Route path="*" element={<Login onLogin={setLoggedIn} />} />
                </Fragment>
              ) : (
                <Fragment>
                  {/* Rutas logueado */}
                  <Route path="/" element={<Home />} />
                  <Route path="/publicar" element={<Publicar />} />
                  <Route path="/likes" element={<Likes />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:id" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<Profile />} />

                  {/* Wizard también disponible estando logueado (necesario para el botón "+") */}
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/registro/ConOfre" element={<ConOfre />} />
                  <Route path="/registro/Etiqueta1" element={<Etiqueta1 />} />
                  <Route path="/registro/Etiqueta2" element={<Etiqueta2 />} />
                  <Route path="/registro/Foto" element={<Foto />} />

                  {/* Internas */}
                  <Route
                    path="/perfiles"
                    element={
                      <>
                        <h1>SkillSwap</h1>
                        <PerfilesForm onCreated={refrescar} />
                        <PerfilesList key={`perfiles-${refreshKey}`} />
                      </>
                    }
                  />
                  <Route
                    path="/habilidades"
                    element={
                      <>
                        <h1>Habilidades</h1>
                        <HabilidadesForm onCreated={refrescar} />
                        <HabilidadesList key={`habilidades-${refreshKey}`} />
                      </>
                    }
                  />

                  <Route path="*" element={<Home />} />
                </Fragment>
              )}
            </Routes>
          </Suspense>

          {/* Barra inferior solo si hay sesión */}
          {loggedIn && (
            <Suspense fallback={null}>
              <BottomBar />
            </Suspense>
          )}
        </div>
      </RegistroFlowProvider>
    </Router>
  );
}

export default App;
