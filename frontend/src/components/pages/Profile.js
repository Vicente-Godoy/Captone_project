import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../../api";
import { getAuth } from "firebase/auth";
import { getMyCalendar, cancelCalendarEvent } from "../../services/calendar";
import { fetchPublications, deletePublication } from "../../services/publications";
import { DEFAULT_AVATAR } from "../../utils/placeholders";
import { toast } from "../../utils/toast";
import "./Profile.css";

function Profile() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const me = getAuth().currentUser;
  const isMe = !!(me && id && me.uid === id);

  const toJSDate = (ts) => {
    if (!ts) return null;
    if (typeof ts.toDate === "function") return ts.toDate();
    if (typeof ts === "string") {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof ts._seconds === "number") return new Date(ts._seconds * 1000);
    if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
    return null;
  };

  const formatDateTime = (d) => {
    if (!d) return "(sin fecha)";
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setPerfil(data))
      .catch((err) => console.error("Error cargando perfil:", err));
  }, [id]);

  useEffect(() => {
    let active = true;
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        const all = await fetchPublications();
        if (!active) return;
        const mine = (all || []).filter(
          (p) => p.creatorId === id || p.authorUid === id
        );
        setPosts(mine);
      } catch (e) {
        console.error("Error cargando publicaciones del perfil:", e);
        if (active) setPosts([]);
      } finally {
        if (active) setLoadingPosts(false);
      }
    };
    loadPosts();
    return () => {
      active = false;
    };
  }, [id]);

  const handleDeletePost = async (postId) => {
    const ok = window.confirm('¿Eliminar esta publicación?');
    if (!ok) return;
    try {
      await deletePublication(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Publicación eliminada');
    } catch (err) {
      console.error('No se pudo eliminar la publicación:', err);
      toast.error('No se pudo eliminar la publicación');
    }
  };

  useEffect(() => {
    if (!isMe || activeTab !== "calendario") return;
    let cancel = false;
    (async () => {
      try {
        setLoadingEvents(true);
        const data = await getMyCalendar();
        if (!cancel) setEvents(data || []);
      } catch (e) {
        if (!cancel) setEvents([]);
        console.error("Error cargando calendario:", e);
      } finally {
        if (!cancel) setLoadingEvents(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [activeTab, isMe]);

  const renderContent = () => {
    switch (activeTab) {
      case "publicaciones":
        return (
          <div className="profile-panel profile-posts">
            {loadingPosts && <p className="profile-posts__state">Cargando publicaciones...</p>}
            {!loadingPosts && posts.length === 0 && (
              <p className="profile-posts__state">Este usuario aún no tiene publicaciones.</p>
            )}
            {!loadingPosts && posts.length > 0 && (
              <ul className="profile-posts__list">
                {posts.map((post) => (
                  <li key={post.id} className="profile-posts__item">
                    <div className="profile-posts__info">
                      <div className="profile-posts__title">{post.title || post.titulo}</div>
                      {post.descripcion && (
                        <div className="profile-posts__desc">{post.descripcion}</div>
                      )}
                    </div>
                    {isMe && (
                      <button
                        className="profile-posts__more"
                        onClick={() => handleDeletePost(post.id)}
                        title="Eliminar publicación"
                      >
                        &#8942;
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case "fotos":
        return <div className="profile-panel">Aquí se mostrarán las fotos.</div>;
      case "calendario":
        return (
          <div className="profile-panel profile-calendar">
            {loadingEvents && <div className="profile-calendar__state">Cargando eventos...</div>}
            {!loadingEvents && events.length === 0 && <div className="profile-calendar__state">No tienes eventos agendados.</div>}
            {!loadingEvents && events.length > 0 && (
              <ul className="profile-calendar__list">
                {events.map((ev) => {
                  const d = toJSDate(ev.startAt);
                  const when = formatDateTime(d);
                  const isFuture = d ? d.getTime() > Date.now() - 60_000 : false;
                  return (
                    <li key={ev.id} className="profile-calendar__item">
                      <div className="profile-calendar__info">
                        <div className="profile-calendar__date">{when}</div>
                        {ev.other?.nombre && (
                          <div className="profile-calendar__other">Con: {ev.other.nombre}</div>
                        )}
                      </div>
                      {isFuture && (
                        <button
                          className="profile-calendar__cancel"
                          onClick={async () => {
                            const otherName = ev.other?.nombre || "el otro usuario";
                            const ok = window.confirm(
                              `¿Cancelar esta reunión con ${otherName}?\nEsto la quitará del calendario de ambos.`
                            );
                            if (!ok) return;
                            try {
                              await cancelCalendarEvent(ev.id);
                              const data = await getMyCalendar();
                              setEvents(data || []);
                            } catch (e) {
                              console.error("No se pudo cancelar", e);
                            }
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      case "resenas":
        return <div className="profile-panel">Aquí se mostrarán las reseñas.</div>;
      default:
        return null;
    }
  };

  if (!perfil) return <p className="profile-loading">Cargando perfil...</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={perfil.fotoUrl || DEFAULT_AVATAR}
            alt="Perfil"
            className="profile-avatar"
          />
          <div>
            <h2 className="profile-name">{perfil.nombre}</h2>
            {perfil.bio && <p className="profile-bio">{perfil.bio}</p>}
            {(perfil.ciudad || perfil.region) && (
              <p className="profile-location">
                {[perfil.ciudad, perfil.region].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === "publicaciones" ? "is-active" : ""}`}
            onClick={() => setActiveTab("publicaciones")}
          >
            Publicaciones
          </button>
          <button
            className={`profile-tab ${activeTab === "fotos" ? "is-active" : ""}`}
            onClick={() => setActiveTab("fotos")}
          >
            Fotos
          </button>
          {isMe && (
            <button
              className={`profile-tab ${activeTab === "calendario" ? "is-active" : ""}`}
              onClick={() => setActiveTab("calendario")}
            >
              Calendario
            </button>
          )}
          <button
            className={`profile-tab ${activeTab === "resenas" ? "is-active" : ""}`}
            onClick={() => setActiveTab("resenas")}
          >
            Reseñas
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

export default Profile;
