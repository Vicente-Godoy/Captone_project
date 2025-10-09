import React, { useState } from "react";

function Profile() {
  const [activeTab, setActiveTab] = useState("publicaciones");

  const renderContent = () => {
    switch (activeTab) {
      case "publicaciones":
        return <div style={styles.content}>Aquí se mostrarán las publicaciones.</div>;
      case "fotos":
        return <div style={styles.content}>Aquí se mostrarán las fotos.</div>;
      case "resenas":
        return <div style={styles.content}>Aquí se mostrarán las reseñas.</div>;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Encabezado con foto y nombre */}
      <div style={styles.header}>
        <img
          src="https://via.placeholder.com/80"
          alt="Perfil"
          style={styles.profileImage}
        />
        <h2 style={styles.name}>Nombre del Usuario</h2>
      </div>

      {/* Barra de tabs */}
      <div style={styles.tabBar}>
        <div
          style={activeTab === "publicaciones" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab("publicaciones")}
        >
          Publicaciones
        </div>
        <div
          style={activeTab === "fotos" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab("fotos")}
        >
          Fotos
        </div>
        <div
          style={activeTab === "resenas" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab("resenas")}
        >
          Reseñas
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {renderContent()}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    paddingTop: "20px",
    maxWidth: "500px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  profileImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  name: {
    margin: 0,
    textAlign: "left",
  },
  tabBar: {
    display: "flex",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #d32f2f", // borde rojo
    backgroundColor: "#d32f2f", // barra roja
    marginBottom: "20px",
    cursor: "pointer",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    textAlign: "center",
    fontWeight: "bold",
    color: "white", // letras blancas por defecto
    transition: "0.3s",
  },
  activeTab: {
    backgroundColor: "white", // tab activo blanco
    color: "#d32f2f", // letras rojas
  },
  content: {
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    minHeight: "150px",
    backgroundColor: "#f9f9f9",
  },
};

export default Profile;