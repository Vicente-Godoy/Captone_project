import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { FaHome, FaHeart, FaComments, FaUser } from "react-icons/fa";
import PostButton from "./PostButton";
import "./BottomBar.css";

export default function BottomBar() {
  const navigate = useNavigate();

  const goToMyProfile = () => {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      navigate(`/profile/${uid}`);
    } else {
      navigate(`/profile`);
    }
  };

  return (
    <div className="bottombar">
      <NavLink
        to="/"
        className={({ isActive }) => `bb-link ${isActive ? "active" : ""}`}
      >
        <FaHome size={22} />
      </NavLink>

      <NavLink
        to="/likes"
        className={({ isActive }) => `bb-link ${isActive ? "active" : ""}`}
      >
        <FaHeart size={22} />
      </NavLink>

      <NavLink
        to="/chat"
        className={({ isActive }) => `bb-link ${isActive ? "active" : ""}`}
      >
        <FaComments size={22} />
      </NavLink>

      <button
        type="button"
        onClick={goToMyProfile}
        className="bb-link"
        aria-label="Mi perfil"
        title="Mi perfil"
      >
        <FaUser size={22} />
      </button>

      {/* FAB centrado */}
      <PostButton onClick={() => navigate("/registro/ConOfre")} />
    </div>
  );
}
