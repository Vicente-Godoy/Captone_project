import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { FaHome, FaHeart, FaBell } from "react-icons/fa";
import PostButton from "./PostButton";
import "./BottomBar.css";
import { getNotifications } from "../services/notifications";
import { getMatches } from "../services/interactions";
import API_BASE from "../api";
import { DEFAULT_AVATAR } from "../utils/placeholders";

export default function BottomBar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  const refreshNotifications = async () => {
    try {
      const data = await getNotifications();
      const items = Array.isArray(data) ? data : [];
      setUnreadCount(items.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  const refreshChats = async () => {
    try {
      const data = await getMatches();
      const user = getAuth().currentUser;
      const uid = user?.uid;
      if (!uid) return;
      const count = (Array.isArray(data) ? data : []).reduce((acc, match) => {
        const lastMessageAt = match.lastMessageAt ? Date.parse(match.lastMessageAt) : 0;
        const lastSeenRaw = match.lastSeenBy?.[uid];
        const lastSeen = lastSeenRaw ? Date.parse(lastSeenRaw) : 0;
        if (lastMessageAt && lastMessageAt > lastSeen) return acc + 1;
        return acc;
      }, 0);
      setUnreadChats(count);
    } catch (error) {
      console.error("Error cargando chats:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      await refreshNotifications();
    };
    load();
    const interval = setInterval(load, 60000);
    const handler = () => load();
    window.addEventListener("notifications-updated", handler);
    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handler);
    };
  }, []);

  useEffect(() => {
    refreshChats();
    const interval = setInterval(refreshChats, 60000);
    const handler = () => refreshChats();
    window.addEventListener("chats-updated", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("chats-updated", handler);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const auth = getAuth();
    const loadAvatar = async (user) => {
      if (!mounted) return;
      if (!user) {
        setAvatarUrl(DEFAULT_AVATAR);
        return;
      }
      let next = user.photoURL;
      if (!next) {
        try {
          const res = await fetch(`${API_BASE}/api/users/${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            next = data.fotoUrl;
          }
        } catch (error) {
          console.warn("Avatar fallback no disponible:", error);
        }
      }
      setAvatarUrl(next || DEFAULT_AVATAR);
    };
    const unsubscribe = auth.onAuthStateChanged(loadAvatar);
    loadAvatar(auth.currentUser);
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

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
        {unreadChats > 0 && <span className="bb-badge small">{unreadChats > 9 ? "9+" : unreadChats}</span>}
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) => `bb-link notifications-btn ${isActive ? "active" : ""}`}
      >
        <FaBell size={22} />
        {unreadCount > 0 && <span className="bb-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </NavLink>

      <button
        type="button"
        onClick={goToMyProfile}
        className="bb-link bb-avatarBtn"
        aria-label="Mi perfil"
        title="Mi perfil"
      >
        <img
          src={avatarUrl || DEFAULT_AVATAR}
          alt="Avatar"
          className="bb-avatar"
          onError={(event) => (event.currentTarget.src = DEFAULT_AVATAR)}
        />
      </button>

      {/* FAB centrado */}
      <PostButton onClick={() => navigate("/registro/ConOfre")} />
    </div>
  );
}
