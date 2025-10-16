import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas de autenticación / registro
import Login from "./components/login/Login";
import Registro from "./components/registro/Registro";
import ConOfre from "./components/registro/ConOfre";
import Etiqueta1 from "./components/registro/Etiqueta1";
import Etiqueta2 from "./components/registro/Etiqueta2";
import Foto from "./components/registro/Foto";

// Páginas logueadas y gestión
import Home from "./components/pages/Home";
import Likes from "./components/pages/Likes";
import Chat from "./components/pages/Chat";
import Profile from "./components/pages/Profile";
import BottomBar from "./components/BottomBar";

// Componentes internos existentes
import PerfilesList from "./components/perfiles/PerfilesList";
import PerfilesForm from "./components/perfiles/PerfilesForm";
import HabilidadesList from "./components/habilidades/HabilidadesList";
import HabilidadesForm from "./components/habilidades/HabilidadesForm";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado temporal para registrar al usuario
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    conocimiento: "",
    descripcion: "",
    etiquetas1: [],
    etiquetas2: [],
    foto: null,
  });

  const refrescar = () => setRefreshKey((k) => k + 1);

  // --- Si no está logueado ---
  if (!loggedIn) {
    return (
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Login onLogin={setLoggedIn} />}
          />
          <Route
            path="/Registro"
            element={
              <Registro
                userData={userData}
                setUserData={setUserData}
              />
            }
          />
          <Route
            path="/ConOfre"
            element={
              <ConOfre
                userData={userData}
                setUserData={setUserData}
              />
            }
          />
          <Route
            path="/Etiqueta1"
            element={
              <Etiqueta1
                userData={userData}
                setUserData={setUserData}
              />
            }
          />
          <Route
            path="/Etiqueta2"
            element={
              <Etiqueta2
                userData={userData}
                setUserData={setUserData}
              />
            }
          />
          <Route
            path="/Foto"
            element={
              <Foto
                userData={userData}
                setUserData={setUserData}
                onFinish={() => setLoggedIn(true)}
              />
            }
          />
        </Routes>
      </Router>
    );
  }

  // --- Si está logueado ---
  return (
    <Router>
      <div style={{ paddingBottom: "90px" }}>
        <Routes>
          {/* Navegación principal */}
          <Route path="/" element={<Home />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />

          {/* Rutas internas existentes */}
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

        {/* Barra inferior flotante */}
        <BottomBar />
      </div>
    </Router>
  );
}

export default App;