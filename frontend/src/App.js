import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import Registro from "./components/registro/Registro";
import ConOfre from "./components/registro/ConOfre";
import Etiqueta1 from "./components/registro/Etiqueta1";
import Etiqueta2 from "./components/registro/Etiqueta2";
import Foto from "./components/registro/Foto";
import PerfilesList from "./components/perfiles/PerfilesList";
import PerfilesForm from "./components/perfiles/PerfilesForm";
import HabilidadesList from "./components/habilidades/HabilidadesList";
import HabilidadesForm from "./components/habilidades/HabilidadesForm";

// Ajuste de rutas de páginas y Card
import Home from "./components/pages/Home";
import Likes from "./components/pages/Likes";
import Chat from "./components/pages/Chat";
import Profile from "./components/pages/Profile";
import BottomBar from "./components/BottomBar";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refrescar = () => setRefreshKey((k) => k + 1);

  // --- Si no está logueado ---
  if (!loggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={setLoggedIn} />} />
          <Route path="/Registro" element={<Registro />} />
          <Route path="/Conofre" element={<ConOfre />} />
          <Route path="/Etiqueta1" element={<Etiqueta1 />} />
          <Route path="/Etiqueta2" element={<Etiqueta2 />} />
          <Route path="/Foto" element={<Foto />} />
        </Routes>
      </Router>
    );
  }

  // --- Si está logueado ---
  return (
    <Router>
      <div style={{ paddingBottom: "90px" }}>
        <Routes>
          {/* Nueva navegación principal */}
          <Route path="/" element={<Home />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />

          {/* Rutas internas que ya tienes (puedes usarlas más adelante si quieres mostrar formularios dentro del Home) */}
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
        </Routes>

        {/* Barra inferior flotante presente en todas las páginas logueadas */}
        <BottomBar />
      </div>
    </Router>
  );
}

export default App;