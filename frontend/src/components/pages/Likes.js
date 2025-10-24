import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMatches } from "../../services/interactions";
import { toast } from "../../utils/toast";

function Likes() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMatches();
        setItems(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: 12 }}>Mis Matches</h2>
      {loading && <div style={{ color: "#666" }}>Cargando...</div>}
      {error && <div style={{ color: "#d33" }}>Error: {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div style={{ color: "#666" }}>Aún no tienes matches.</div>
      )}
      <div style={styles.list}>
        {items.map((m) => (
          <div key={m.id} style={styles.card}>
            <img
              src={m.other?.fotoUrl || "https://via.placeholder.com/48"}
              alt={m.other?.nombre || "usuario"}
              style={styles.avatar}
            />
            <div style={{ flex: 1 }}>
              <div style={styles.name}>{m.other?.nombre || "Usuario"}</div>
              <div style={styles.meta}>Match ID: {m.id}</div>
            </div>
            <button
              style={styles.chatBtn}
              onClick={() => navigate(`/chat/${m.id}`)}
            >
              Chatear
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    paddingTop: "40px",
  },
  list: {
    marginTop: 16,
    padding: "0 16px",
    display: "grid",
    gap: 12,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover",
  },
  name: { fontWeight: "bold", textAlign: "left" },
  meta: { fontSize: 12, color: "#666", textAlign: "left" },
  chatBtn: {
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default Likes;
