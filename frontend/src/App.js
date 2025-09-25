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

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refrescar = () => setRefreshKey((k) => k + 1);

  // Si no está logueado, mostrar el flujo de Login/Registro
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

  // Si está logueado, mostrar la aplicación principal
  return (
    <div style={{ padding: 20 }}>
      <h1>SkillSwap</h1>

      {/* Crear y listar Perfiles */}
      <PerfilesForm onCreated={refrescar} />
      <PerfilesList key={`perfiles-${refreshKey}`} />

      <hr />

      {/* Crear y listar Habilidades */}
      <HabilidadesForm onCreated={refrescar} />
      <HabilidadesList key={`habilidades-${refreshKey}`} />
    </div>
  );
}

export default App;