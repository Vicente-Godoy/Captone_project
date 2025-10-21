import React, { useState, memo, useMemo } from "react";
import { FaHeart, FaStar } from "react-icons/fa";

function Card({
  imageUrl,
  title,
  description,
  rating = 0,            // viene cualquier cosa -> lo normalizamos
  liked,                 // controlado (boolean) opcional
  onLike,                // (nuevoEstado:boolean) => void
  onViewProfile,         // () => void
}) {
  const isControlled = typeof liked === "boolean";
  const [likedLocal, setLikedLocal] = useState(false);
  const isLiked = isControlled ? liked : likedLocal;

  const displayRating = useMemo(() => {
    const n = Number(rating);
    return Number.isFinite(n) ? n.toFixed(1) : "0.0";
  }, [rating]);

  const toggleLike = () => {
    if (!isControlled) setLikedLocal((v) => !v);
    onLike?.(!isLiked);
  };

  const safeTitle = title || "SIN NOMBRE";
  const safeDesc = description || "Sin descripción disponible";
  const img = imageUrl || "https://via.placeholder.com/96";

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        {/* Imagen / avatar */}
        <img
          src={img}
          alt={safeTitle}
          style={styles.img}
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/96")}
          loading="lazy"
          decoding="async"
        />

        {/* Contenido */}
        <div style={styles.body}>
          {/* Rating + título */}
          <div style={styles.headerLine}>
            <div style={styles.ratingWrap} title={`Rating ${displayRating}`}>
              <FaStar size={12} style={{ marginRight: 6 }} />
              <span style={styles.ratingText}>{displayRating}</span>
            </div>
            <h3 style={styles.title}>{safeTitle}</h3>
          </div>

          {/* Descripción */}
          <p style={{ ...styles.desc, ...styles.clamp2 }}>{safeDesc}</p>

          {/* Acciones */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.viewBtn}
              onClick={onViewProfile}
              aria-label="Ver perfil"
            >
              VER PERFIL
            </button>

            <button
              type="button"
              style={{
                ...styles.likePill,
                backgroundColor: isLiked ? "#e64545" : "#eee",
              }}
              onClick={toggleLike}
              aria-label={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
              aria-pressed={isLiked}
            >
              <FaHeart color={isLiked ? "#fff" : "#111"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: "14px auto",
    width: "92%",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  },
  row: { display: "flex", gap: 16, alignItems: "center" },
  img: {
    width: 96,
    height: 96,
    borderRadius: 12,
    objectFit: "cover",
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
  headerLine: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 12,
    alignItems: "center",
  },
  ratingWrap: {
    display: "inline-flex",
    alignItems: "center",
    color: "#d33",
    fontWeight: 700,
    fontSize: 13,
  },
  ratingText: { transform: "translateY(-1px)" },
  title: {
    margin: 0,
    fontSize: 18,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#222",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  desc: {
    margin: "8px 0 12px",
    color: "#666",
    fontSize: 13,
    lineHeight: 1.35,
    textTransform: "uppercase",
  },
  clamp2: {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewBtn: {
    border: "none",
    background: "transparent",
    color: "#111",
    fontWeight: 700,
    letterSpacing: 0.4,
    cursor: "pointer",
    padding: 0,
  },
  likePill: {
    border: "none",
    borderRadius: 10,
    padding: "8px 14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
};

export default memo(Card);
