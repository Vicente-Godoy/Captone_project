import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../../api";
import { getAuth, updateProfile } from "firebase/auth";
import { getMyCalendar, cancelCalendarEvent } from "../../services/calendar";
import { fetchPublications, deletePublication } from "../../services/publications";
import { getReviewsByPost, createReview } from "../../services/reviews";
import { uploadAvatarImage, MAX_IMAGE_BYTES } from "../../services/storage";
import { DEFAULT_AVATAR } from "../../utils/placeholders";
import { optimizeImageFile } from "../../utils/image";
import { toast } from "../../utils/toast";
import { FaStar } from "react-icons/fa";
import "./Profile.css";

const StarDisplay = ({ value = 0, size = 14 }) => {
  const safe = Math.max(0, Math.min(5, Number(value) || 0));
  const stars = Array.from({ length: 5 }, (_, idx) =>
    Math.max(0, Math.min(1, safe - idx))
  );
  return (
    <div className="star-display" style={{ fontSize: `${size}px` }}>
      {stars.map((fill, idx) => (
        <span
          key={`star-${idx}`}
          className="star-display__item"
          style={{
            "--fill": `${(fill * 100).toFixed(0)}%`,
          }}
        >
          <FaStar />
        </span>
      ))}
    </div>
  );
};

function Profile() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [activeTab, setActiveTab] = useState("publicaciones");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postMenuId, setPostMenuId] = useState(null);
  const [reviewsModal, setReviewsModal] = useState({
    open: false,
    post: null,
    reviews: [],
    loading: false,
    error: "",
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
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
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
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

  useEffect(() => {
    const closeMenus = (event) => {
      if (!event.target.closest(".profile-posts__menu")) {
        setPostMenuId(null);
      }
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

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

  const profileRating = useMemo(() => {
    if (!posts.length) return { avg: 0, reviews: 0 };
    let total = 0;
    let reviews = 0;
    posts.forEach((post) => {
      const count = Number(post.ratingCount) || 0;
      const sum = Number(post.ratingSum);
      if (count > 0 && !Number.isNaN(sum)) {
        total += sum;
        reviews += count;
      }
    });
    const avg =
      reviews > 0
        ? total / reviews
        : posts.reduce((acc, post) => acc + (Number(post.ratingAvg) || 0), 0) /
          posts.length;
    return {
      avg: Number.isFinite(avg) ? avg : 0,
      reviews,
    };
  }, [posts]);

  const handleAvatarFile = async (event) => {
    if (!isMe) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("La imagen supera el limite de 10MB.");
      return;
    }
    try {
      setAvatarUploading(true);
      const optimized = await optimizeImageFile(file);
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error("Debes iniciar sesion.");
      const url = await uploadAvatarImage(optimized, currentUser.uid);
      const token = await currentUser.getIdToken(true);
      await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fotoUrl: url }),
      });
      try {
        await updateProfile(currentUser, { photoURL: url });
      } catch (error) {
        console.warn("No se pudo sincronizar photoURL:", error);
      }
      setPerfil((prev) => (prev ? { ...prev, fotoUrl: url } : prev));
      toast.success("Foto de perfil actualizada.");
    } catch (error) {
      console.error("Error subiendo avatar:", error);
      toast.error(error.message || "No se pudo actualizar la foto.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const ok = window.confirm("Eliminar esta publicacion?");
    if (!ok) return;
    try {
      await deletePublication(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Publicacion eliminada");
    } catch (err) {
      console.error("No se pudo eliminar la publicacion:", err);
      toast.error("No se pudo eliminar la publicacion");
    }
  };

  const openReviewsModal = async (post) => {
    setReviewsModal({
      open: true,
      post,
      reviews: [],
      loading: true,
      error: "",
    });
    try {
      const data = await getReviewsByPost(post.id);
      setReviewsModal((prev) => ({
        ...prev,
        reviews: Array.isArray(data) ? data : [],
        loading: false,
      }));
    } catch (error) {
      setReviewsModal((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "No se pudieron obtener las resenas.",
      }));
    }
  };

  const closeReviewsModal = () => {
    setReviewsModal({
      open: false,
      post: null,
      reviews: [],
      loading: false,
      error: "",
    });
    setReviewForm({ rating: 5, comment: "" });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewsModal.post) return;
    try {
      setSubmittingReview(true);
      await createReview({
        postId: reviewsModal.post.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success("Gracias por tu resena");
      const data = await getReviewsByPost(reviewsModal.post.id);
      setReviewsModal((prev) => ({
        ...prev,
        reviews: Array.isArray(data) ? data : [],
        loading: false,
        error: "",
      }));
      const all = await fetchPublications();
      const mine = (all || []).filter(
        (p) => p.creatorId === id || p.authorUid === id
      );
      setPosts(mine);
    } catch (error) {
      console.error("No se pudo enviar la resena:", error);
      toast.error(error.message || "No se pudo enviar la resena.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const togglePostMenu = (postId) => {
    setPostMenuId((prev) => (prev === postId ? null : postId));
  };

  const handleMenuAction = (action, post) => {
    if (!post) return;
    if (action === "edit") {
      toast.info("La edicion se habilitara mas adelante.");
    } else if (action === "stats") {
      toast.info("Las estadisticas estaran disponibles en otra iteracion.");
    } else if (action === "delete") {
      handleDeletePost(post.id);
    }
    setPostMenuId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "publicaciones":
        return (
          <div className="profile-panel profile-posts">
            {loadingPosts && (
              <p className="profile-posts__state">Cargando publicaciones...</p>
            )}
            {!loadingPosts && posts.length === 0 && (
              <p className="profile-posts__state">
                Este usuario aun no tiene publicaciones.
              </p>
            )}
            {!loadingPosts && posts.length > 0 && (
              <ul className="profile-posts__list">
                {posts.map((post) => (
                  <li key={post.id} className="profile-posts__item">
                    <div className="profile-posts__info">
                      <div className="profile-posts__row">
                        <img
                          src={
                            post.imageUrl ||
                            post.creatorInfo?.fotoUrl ||
                            DEFAULT_AVATAR
                          }
                          alt={post.title || "publicacion"}
                          className="profile-posts__thumb"
                          onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                        />
                        <div>
                          <p className="profile-posts__title">
                            {post.title || post.titulo}
                          </p>
                          <p className="profile-posts__desc">
                            {post.content || post.descripcion || "Sin descripcion"}
                          </p>
                          <div className="profile-posts__ratingSummary">
                            <FaStar size={12} />{" "}
                            <span>
                              {Number(
                                post.ratingAvg ||
                                  (post.ratingCount
                                    ? (post.ratingSum || 0) / post.ratingCount
                                    : 0)
                              ).toFixed(1)}{" "}
                              ({post.ratingCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="profile-posts__actions">
                      <button
                        className="profile-posts__reviewsBtn"
                        onClick={() => openReviewsModal(post)}
                      >
                        Ver resenas
                      </button>
                      {isMe && (
                        <div className="profile-posts__menu">
                          <button
                            type="button"
                            className={`profile-posts__more ${
                              postMenuId === post.id ? "is-open" : ""
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              togglePostMenu(post.id);
                            }}
                            aria-label="Opciones de la publicacion"
                          >
                            &#8942;
                          </button>
                          {postMenuId === post.id && (
                            <div className="profile-posts__menuList">
                              <button
                                type="button"
                                className="profile-posts__menuItem"
                                onClick={() => handleMenuAction("edit", post)}
                              >
                                Editar publicacion
                              </button>
                              <button
                                type="button"
                                className="profile-posts__menuItem"
                                onClick={() => handleMenuAction("stats", post)}
                              >
                                Estadisticas
                              </button>
                              <button
                                type="button"
                                className="profile-posts__menuItem profile-posts__menuItem--danger"
                                onClick={() => handleMenuAction("delete", post)}
                              >
                                Eliminar publicacion
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case "fotos":
        return <div className="profile-panel">Aqui se mostraran las fotos.</div>;
      case "calendario":
        return (
          <div className="profile-panel profile-calendar">
            {loadingEvents && (
              <div className="profile-calendar__state">Cargando eventos...</div>
            )}
            {!loadingEvents && events.length === 0 && (
              <div className="profile-calendar__state">
                No tienes eventos agendados.
              </div>
            )}
            {!loadingEvents && events.length > 0 && (
              <ul className="profile-calendar__list">
                {events.map((ev) => {
                  const d = toJSDate(ev.startAt);
                  const when = formatDateTime(d);
                  const isFuture = d ? d.getTime() > Date.now() - 60000 : false;
                  return (
                    <li key={ev.id} className="profile-calendar__item">
                      <div className="profile-calendar__info">
                        <div className="profile-calendar__date">{when}</div>
                        {ev.other?.nombre && (
                          <div className="profile-calendar__other">
                            Con: {ev.other.nombre}
                          </div>
                        )}
                      </div>
                      {isFuture && (
                        <button
                          className="profile-calendar__cancel"
                          onClick={async () => {
                            try {
                              await cancelCalendarEvent(ev.id);
                              const data = await getMyCalendar();
                              setEvents(data || []);
                            } catch (e) {
                              toast.error("No se pudo cancelar la reunion.");
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
      default:
        return null;
    }
  };

  if (!perfil) return <p className="profile-loading">Cargando perfil...</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <button
            type="button"
            className={`profile-avatarBtn ${isMe ? "is-editable" : ""}`}
            onClick={() => isMe && avatarInputRef.current?.click()}
            disabled={!isMe || avatarUploading}
          >
            <img
              src={perfil.fotoUrl || DEFAULT_AVATAR}
              alt="Perfil"
              className="profile-avatar"
              onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
            />
            {isMe && (
              <span className="profile-avatar__hint">
                {avatarUploading ? "Subiendo..." : "Cambiar foto"}
              </span>
            )}
          </button>
          {isMe && (
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarFile}
            />
          )}
          <div>
            <h2 className="profile-name">{perfil.nombre}</h2>
            <div className="profile-ratingRow">
              <StarDisplay value={profileRating.avg} size={18} />
              <span>
                {profileRating.avg.toFixed(2)} ({profileRating.reviews} resenas)
              </span>
            </div>
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
            className={`profile-tab ${
              activeTab === "publicaciones" ? "is-active" : ""
            }`}
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
              className={`profile-tab ${
                activeTab === "calendario" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("calendario")}
            >
              Calendario
            </button>
          )}
        </div>

        {renderContent()}
      </div>

      {reviewsModal.open && (
        <div className="reviews-modal">
          <div className="reviews-modal__card">
            <div className="reviews-modal__header">
              <div>
                <h3>
                  Resenas de {reviewsModal.post?.title || "publicacion"}
                </h3>
                <p>{reviewsModal.post?.descripcion}</p>
              </div>
              <button className="reviews-modal__close" onClick={closeReviewsModal}>
                Cerrar
              </button>
            </div>
            {reviewsModal.loading && <p>Cargando resenas...</p>}
            {reviewsModal.error && (
              <p style={{ color: "#ff9d9d" }}>{reviewsModal.error}</p>
            )}
            {!reviewsModal.loading &&
              !reviewsModal.error &&
              reviewsModal.reviews.length === 0 && (
                <p>No hay resenas todavia.</p>
              )}
            {!reviewsModal.loading &&
              !reviewsModal.error &&
              reviewsModal.reviews.length > 0 && (
                <ul className="reviews-list">
                  {reviewsModal.reviews.map((rev) => (
                    <li key={rev.id} className="reviews-list__item">
                      <div className="reviews-list__info">
                        <strong>{rev.student?.nombre || "Usuario"}</strong>
                        <span>
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <div className="reviews-list__rating">
                        <FaStar size={12} />{" "}
                        {rev.rating?.toFixed?.(1) || rev.rating}
                      </div>
                      {rev.comment && <p>{rev.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            {!isMe &&
              me?.uid &&
              !reviewsModal.reviews.some((rev) => rev.studentUid === me.uid) && (
                <form className="reviews-form" onSubmit={handleSubmitReview}>
                  <label>
                    Calificacion
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          type="button"
                          key={value}
                          className={`star ${
                            reviewForm.rating >= value ? "is-active" : ""
                          }`}
                          onClick={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: value,
                            }))
                          }
                        >
                          <FaStar size={18} className="starIcon" />
                        </button>
                      ))}
                    </div>
                  </label>
                  <label>
                    Resena (opcional)
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn-pill primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Enviando..." : "Enviar resena"}
                  </button>
                </form>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
