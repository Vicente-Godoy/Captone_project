import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Card from "../Card";
import BottomBar from "../BottomBar"; // 👈 tu barra flotante
import API_BASE from "../../api"; // ajusta la ruta

export default function Home() {
  const navigate = useNavigate();
  const [perfiles, setPerfiles] = useState([]);

  // Traemos los perfiles desde la API
  // useEffect(() => {
  //   fetch("http://localhost:5000/api/perfiles") // ajusta la URL si tu backend corre en otro puerto
  //     .then((res) => res.json())
  //     .then((data) => setPerfiles(data))
  //     .catch((err) => console.error("Error cargando perfiles:", err));
  // }, []);
  useEffect(() => {
    fetch(`${API_BASE}/api/perfiles`)
      .then(res => res.json())
      .then(data => setPerfiles(Array.isArray(data) ? data : (data.perfiles ?? [])))
      .catch(err => console.error("Error cargando perfiles:", err));
  }, []);

  return (
    <div className="home" style={{ paddingBottom: "90px" }}> {/* espacio para BottomBar */}
      <h2 className="home__title">Home</h2>

      {perfiles.length === 0 ? (
        <p>No hay perfiles disponibles</p>
      ) : (
        perfiles.map((perfil) => (
          <Card
            key={perfil.id}
            title={perfil.conocimiento || perfil.nombre}
            description={perfil.descripcion || ""}
            imageUrl={perfil.foto || "https://via.placeholder.com/96"}
            onViewProfile={() => navigate(`/profile/${perfil.id}`)}
          />
        ))
      )}

      {/* Barra flotante fija */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 999,
      }}>
        <BottomBar />
      </div>
    </div>
  );
}