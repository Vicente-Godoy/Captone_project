import React, { useState } from "react";
import { FaHeart } from "react-icons/fa";

function Card() {
  const [liked, setLiked] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.content}>
        <div style={styles.text}>Card vacía</div>
        <button
          style={{
            ...styles.likeButton,
            backgroundColor: liked ? "#ff4d4d" : "#ddd",
          }}
          onClick={() => setLiked(!liked)}
        >
          <FaHeart color={liked ? "white" : "black"} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    margin: "10px auto",
    width: "90%",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    color: "#333",
  },
  likeButton: {
    border: "none",
    borderRadius: "50%",
    padding: "10px",
    cursor: "pointer",
    transition: "0.3s",
  },
};

export default Card;