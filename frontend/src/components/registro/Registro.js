import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registro() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");

  return (
    <div style={{ padding: 20 }}>
      <h2>Registro</h2>

      {/* Formulario simple */}
      <div>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
          required
        />
      </div>

      {/* Botón original que mantiene tu navegación */}
      <button
        onClick={() => {
          console.log("Datos de registro:", { nombre, email, contrasena });
          navigate("/ConOfre");
        }}
      >
        Siguiente
      </button>
    </div>
  );
}

export default Registro;