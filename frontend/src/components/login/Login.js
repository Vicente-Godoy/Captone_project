import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate(); // Hook para navegación

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && pass) {
      onLogin(true);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <br />
        <button type="submit">Ingresar</button>
      </form>
      <br />
      <button onClick={() => navigate("/registro")}>Registrarse</button>
    </div>
  );
}

export default Login;