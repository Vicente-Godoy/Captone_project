import React, { useState } from "react";
import PerfilesList from "./components/perfiles/PerfilesList";
import PerfilesForm from "./components/perfiles/PerfilesForm";
import HabilidadesList from "./components/habilidades/HabilidadesList";
import HabilidadesForm from "./components/habilidades/HabilidadesForm";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refrescar = () => setRefreshKey(k => k + 1);

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
