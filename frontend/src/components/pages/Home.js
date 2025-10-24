// src/components/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostList from "../post/PostList";
import "./Home.css";
import LogoutButton from "../common/LogoutButton";
import SyncButton from "../common/SyncButton";
import { fetchPublications } from "../../services/publications";
import { likePublication } from "../../services/interactions";
import { toast } from "../../utils/toast";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPosts = async () => {
    try {
      console.log('[HOME] Refreshing posts...');
      setLoading(true);
      const data = await fetchPublications();
      console.log('[HOME] Posts refreshed:', data.length);
      setPosts(data || []);
      setError(null);
    } catch (err) {
      console.error('[HOME] Error refreshing posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__brand">SS</div>
        <input
          className="home__search"
          placeholder="¿Qué te interesa?"
          aria-label="Buscar"
        />
      </header>

      <main className="home__content">
        <div style={{ padding: "12px 16px", display: "flex", gap: "8px", alignItems: "center" }}>
          <LogoutButton />
          {process.env.REACT_APP_SHOW_SYNC_BUTTON === 'true' && <SyncButton />}
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Cargando publicaciones...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "20px", color: "#d33" }}>
            Error: {error}
          </div>
        )}

        <PostList
          posts={posts}
          onLike={async (post) => {
            try {
              const res = await likePublication(post.id);
              if (res.matched) {
                toast.success('¡Tienen un match!');
              } else {
                toast.info('Like enviado');
              }
            } catch (e) {
              toast.error(e.message);
            }
          }}
          onViewProfile={(post) => {
            const authorUid = post.authorUid || post.creatorId;
            if (authorUid) {
              navigate(`/profile/${authorUid}`);
            }
          }}
        />
      </main>
    </div>
  );
}
