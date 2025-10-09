import React from "react";
import Card from "../Card"; // ← ruta corregida

function Home() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Explorar Perfiles</h2>
      {[1, 2, 3, 4, 5].map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f8f8f8",
    minHeight: "100vh",
    paddingTop: "20px",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
};

export default Home;