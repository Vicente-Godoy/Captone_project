// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RegistroFlowProvider } from "./components/registro/RegistroFlow";

// Auth / registro (pasos)
import Login from "./components/login/Login";
import Registro from "./components/registro/Registro";
import ConOfre from "./components/registro/ConOfre";
import Etiqueta1 from "./components/registro/Etiqueta1";
import Etiqueta2 from "./components/registro/Etiqueta2";
import Foto from "./components/registro/Foto";

// Páginas logueadas
import Home from "./components/pages/Home";
import Likes from "./components/pages/Likes";
import Chat from "./components/pages/Chat";
import Profile from "./components/pages/Profile";
import BottomBar from "./components/BottomBar";

// Internas existentes
import PerfilesList from "./components/perfiles/PerfilesList";
import PerfilesForm from "./components/perfiles/PerfilesForm";
import HabilidadesList from "./components/habilidades/HabilidadesList";
import HabilidadesForm from "./components/habilidades/HabilidadesForm";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refrescar = () => setRefreshKey((k) => k + 1);

  return (
    <Router>
      {!loggedIn ? (
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Login onLogin={setLoggedIn} />} />

          {/* Wizard de registro envuelto por el Provider */}
          <Route
            path="/registro/*"
            element={
              <RegistroFlowProvider>
                <Routes>
                  <Route index element={<Registro />} />              {/* /registro */}
                  <Route path="ConOfre" element={<ConOfre />} />      {/* /registro/ConOfre */}
                  <Route path="Etiqueta1" element={<Etiqueta1 />} />  {/* /registro/Etiqueta1 */}
                  <Route path="Etiqueta2" element={<Etiqueta2 />} />  {/* /registro/Etiqueta2 */}
                  <Route path="Foto" element={<Foto />} />            {/* /registro/Foto */}
                </Routes>
              </RegistroFlowProvider>
            }
          />

          {/* Fallback a login */}
          <Route path="*" element={<Login onLogin={setLoggedIn} />} />
        </Routes>
      ) : (
        <div style={{ paddingBottom: "90px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/likes" element={<Likes />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />

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
          </Routes>

          <BottomBar />
        </div>
      )}
    </Router>
  );
}

export default App;
