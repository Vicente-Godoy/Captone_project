import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../../api";
import { getAuth } from "firebase/auth";
import { getMyCalendar, cancelCalendarEvent } from "../../services/calendar";

function Profile() {
  const { id } = useParams(); // ID del perfil desde la URL
  const [perfil, setPerfil] = useState(null);
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const me = getAuth().currentUser;
  const isMe = !!(me && id && me.uid === id);

  // Helpers para transformar y formatear fechas desde el backend
  const toJSDate = (ts) => {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (typeof ts === 'string') {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    }
    // Firestore Timestamp serializado por Admin SDK suele venir como {_seconds, _nanoseconds}
    if (typeof ts._seconds === 'number') return new Date(ts._seconds * 1000);
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
    return null;
  };

  const formatDateTime = (d) => {
    if (!d) return '(sin fecha)';
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!id) return;
    // Traer perfil público desde el endpoint unificado
    fetch(`${API_BASE}/api/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setPerfil(data))
      .catch((err) => console.error("Error cargando perfil:", err));
  }, [id]);

  useEffect(() => {
    if (!isMe) return;
    if (activeTab !== 'calendario') return;
    let cancel = false;
    (async () => {
      try {
        setLoadingEvents(true);
        const data = await getMyCalendar();
        if (!cancel) setEvents(data || []);
      } catch (e) {
        if (!cancel) setEvents([]);
        console.error('Error cargando calendario:', e);
      } finally {
        if (!cancel) setLoadingEvents(false);
      }
    })();
    return () => { cancel = true; };
  }, [activeTab, isMe]);

  const renderContent = () => {
    switch (activeTab) {
      case "publicaciones":
        return <div style={styles.content}>Aquí se mostrarán las publicaciones.</div>;
      case "fotos":
        return <div style={styles.content}>Aquí se mostrarán las fotos.</div>;
      case "calendario":
        return (
          <div style={styles.content}>
            {loadingEvents && <div>Cargando eventos...</div>}
            {!loadingEvents && events.length === 0 && <div>No tienes eventos agendados.</div>}
            {!loadingEvents && events.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {events.map((ev) => {
                  const d = toJSDate(ev.startAt);
                  const when = formatDateTime(d);
                  const isFuture = d ? d.getTime() > Date.now() - 60_000 : false;
                  return (
                    <li key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{when}</div>
                        {ev.other?.nombre && <div style={{ fontSize: 13, color: '#555' }}>Con: {ev.other.nombre}</div>}
                      </div>
                      {isFuture && (
                        <button
                          onClick={async () => {
                            const otherName = ev.other?.nombre || 'el otro usuario';
                            const ok = window.confirm(`¿Cancelar esta reunión con ${otherName}?\nEsto la quitará del calendario de ambos.`);
                            if (!ok) return;
                            try {
                              await cancelCalendarEvent(ev.id);
                              // recargar lista
                              const data = await getMyCalendar();
                              setEvents(data || []);
                            } catch (e) {
                              console.error('No se pudo cancelar', e);
                            }
                          }}
                          style={{ background: '#9b1c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}
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
        return <div style={styles.content}>Aquí se mostrarán las reseñas.</div>;
      default:
        return null;
    }
  };

  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div style={styles.container}>
      {/* Encabezado con foto y nombre */}
      <div style={styles.header}>
        <img
          src={perfil.fotoUrl || "https://via.placeholder.com/80"}
          alt="Perfil"
          style={styles.profileImage}
        />
        <div>
          <h2 style={styles.name}>{perfil.nombre}</h2>
          {perfil.bio && (
            <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
              {perfil.bio}
            </p>
          )}
          {(perfil.ciudad || perfil.region) && (
            <p style={{ margin: 0, fontSize: "12px", color: "#777" }}>
              {[perfil.ciudad, perfil.region].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
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
        {isMe && (
          <div
            style={activeTab === "calendario" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => setActiveTab("calendario")}
          >
            Calendario
          </div>
        )}
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
    border: "1px solid #d32f2f",
    backgroundColor: "#d32f2f",
    marginBottom: "20px",
    cursor: "pointer",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    transition: "0.3s",
  },
  activeTab: {
    backgroundColor: "white",
    color: "#d32f2f",
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
