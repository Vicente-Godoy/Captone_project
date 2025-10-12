import React from "react";
import { FaHome, FaHeart, FaComments, FaUser } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function BottomBar() {
  return (
    <div style={styles.container}>
      <NavLink
        to="/"
        style={({ isActive }) =>
          isActive ? { ...styles.icon, ...styles.activeIcon } : styles.icon
        }
      >
        <FaHome size={22} />
      </NavLink>

      <NavLink
        to="/likes"
        style={({ isActive }) =>
          isActive ? { ...styles.icon, ...styles.activeIcon } : styles.icon
        }
      >
        <FaHeart size={22} />
      </NavLink>

      <NavLink
        to="/chat"
        style={({ isActive }) =>
          isActive ? { ...styles.icon, ...styles.activeIcon } : styles.icon
        }
      >
        <FaComments size={22} />
      </NavLink>

      <NavLink
        to="/profile"
        style={({ isActive }) =>
          isActive ? { ...styles.icon, ...styles.activeIcon } : styles.icon
        }
      >
        <FaUser size={22} />
      </NavLink>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "15px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#ff4d4d",
    borderRadius: "30px",
    width: "90%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    color: "white",
    zIndex: 1000,
  },
  icon: {
    color: "white",
    textDecoration: "none",
    padding: "8px",
    borderRadius: "50%",
    transition: "0.3s",
  },
  activeIcon: {
    color: "#ff4d4d", // icono rojo
    backgroundColor: "white", // fondo blanco
  },
};

export default BottomBar;