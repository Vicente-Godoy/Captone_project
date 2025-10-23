import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaHeart, FaComments, FaUser } from "react-icons/fa";
import PostButton from "./PostButton";
import "./BottomBar.css";

export default function BottomBar() {
  const navigate = useNavigate();

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

      <NavLink
        to="/profile"
        className={({ isActive }) => `bb-link ${isActive ? "active" : ""}`}
      >
        <FaUser size={22} />
      </NavLink>

      {/* FAB centrado */}
      <PostButton onClick={() => navigate("/registro/ConOfre")} />
    </div>
  );
}
