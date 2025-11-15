import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMatches } from "../../services/interactions";
import { DEFAULT_AVATAR } from "../../utils/placeholders";
import "./Likes.css";

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
        setError(e.message || "No se pudieron obtener los matches.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderState = () => {
    if (loading) return <p className="likes-state">Cargando matches...</p>;
    if (error) return <p className="likes-state error">Error: {error}</p>;
    if (!items.length) return <p className="likes-state">Aún no tienes matches.</p>;
    return null;
  };

  return (
    <div className="likes-page">
      <div className="likes-wrapper">
        <header className="likes-header">
          <p className="likes-eyebrow">Conexiones desbloqueadas</p>
          <h1>Mis Matches</h1>
          <p className="likes-subtitle">
            Cuando se dan like mutuamente se habilita el chat para coordinar y agendar una sesión.
          </p>
        </header>

        {renderState()}

        <div className="likes-list">
          {items.map((m) => (
            <article key={m.id} className="likes-card">
              <div className="likes-card-info">
                <img
                  src={m.other?.fotoUrl || DEFAULT_AVATAR}
                  alt={m.other?.nombre || "usuario"}
                  className="likes-avatar"
                />
                <div>
                  <p className="likes-name">{m.other?.nombre || "Usuario"}</p>
                  <p className="likes-match">Match ID: {m.id}</p>
                </div>
              </div>
              <button
                className="likes-chat-btn"
                onClick={() => navigate(`/chat/${m.id}`)}
              >
                Chatear
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Likes;
