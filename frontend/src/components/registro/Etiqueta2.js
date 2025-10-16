import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./etiqueta2.css";

function Etiqueta2() {
  const navigate = useNavigate();

  const etiquetas = [
    "DEPORTES", "CIENCIAS", "FITNESS", "ARTES", "MUSICA",
    "IDIOMAS", "FILOSOFÍA", "COMPUTACION", "PROGRAMACIÓN", "ESCRITURA",
    "COCINA", "FINANZAS", "MODA", "ROBÓTICA", "QUÍMICA",
    "HISTORIA", "MATEMÁTICAS", "LITERATURA"
  ];

  const [seleccionadas, setSeleccionadas] = useState([]);
  const [error, setError] = useState("");

  const toggleEtiqueta = (et) => {
    setSeleccionadas(prev =>
      prev.includes(et) ? prev.filter(x => x !== et) : [...prev, et]
    );
  };

  const goNext = async () => {
    if (seleccionadas.length === 0) {
      setError("Debes seleccionar al menos un tema");
      return;
    }

    const userTemp = JSON.parse(sessionStorage.getItem("userTemp") || "{}");
    if (!userTemp.id) {
      setError("Usuario temporal no encontrado");
      return;
    }

    try {
      const token = localStorage.getItem("token") || ""; // si ya tienes JWT
      const res = await fetch(`http://localhost:5000/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          intereses: seleccionadas
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar intereses");
        return;
      }

      // Actualizamos sessionStorage
      sessionStorage.setItem(
        "userTemp",
        JSON.stringify({ ...userTemp, intereses: seleccionadas })
      );

      navigate("/Foto"); // siguiente pantalla
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="e2-page">
      <header className="e2-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
        <h1 className="e2-title">QUE CONOCIMIENTO<br />TE INTERESA?</h1>
      </header>

      <main className="e2-main">
        <p className="e2-sub">
          MARCA LOS TEMAS QUE TE INTERESAN (PUEDES MARCAR MÁS DE UNA)
        </p>

        <div className="chips-grid">
          {etiquetas.map((et) => (
            <button
              key={et}
              type="button"
              onClick={() => toggleEtiqueta(et)}
              className={["chip", seleccionadas.includes(et) ? "selected" : ""].join(" ").trim()}
            >
              {et}
            </button>
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="btn-pill danger" onClick={goNext}>SIGUIENTE</button>
      </main>
    </div>
  );
}

export default Etiqueta2;