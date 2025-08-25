import React, { useEffect, useState } from "react";
import API_BASE from "../../api";

const HabilidadesList = () => {
  const [habilidades, setHabilidades] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/habilidades`)
      .then((res) => res.json())
      .then((data) => setHabilidades(data))
      .catch((err) => console.error("Error cargando habilidades:", err));
  }, []);

  return (
    <div>
      <h2>Habilidades</h2>
      <ul>
        {habilidades.map((h) => (
          <li key={h.ID}>
            {h.NOM_HABILIDADES} (Nivel: {h.NIVEL ?? "-"}) — Perfil #{h.ID_PERFILES}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HabilidadesList;
