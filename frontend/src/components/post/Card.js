// src/components/post/Card.js
import React, { useState } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import "./Card.css";
import { DEFAULT_AVATAR } from "../../utils/placeholders";

function Card({
  imageUrl,
  title,
  description,
  fullDescription,
  rating = 0,
  liked,
  onLike,
  onViewProfile,
  authorName,
  authorUid,
  tags = [],
  interestTags = [],
  expanded = false,
  onToggle,
  extraInfo = {},
}) {
  const isControlled = typeof liked === "boolean";
  const [likedLocal, setLikedLocal] = useState(false);
  const isLiked = isControlled ? liked : likedLocal;

  const toggleLike = () => {
    if (!isControlled) setLikedLocal((v) => !v);
    onLike?.(!isLiked);
  };

  const safeDescription = description || "Sin descripcion disponible";
  const summary =
    !expanded && safeDescription.length > 140
      ? `${safeDescription.slice(0, 140)}...`
      : safeDescription;
  const detailsText = fullDescription || safeDescription;
  const hasTags = Array.isArray(tags) && tags.length > 0;
  const hasInterestTags = Array.isArray(interestTags) && interestTags.length > 0;
  const hasDetails =
    expanded &&
    (detailsText ||
      hasTags ||
      hasInterestTags ||
      extraInfo.modalidad ||
      extraInfo.ciudad ||
      extraInfo.region ||
      extraInfo.nivel);

  return (
    <article className="card">
      <div className="card__row">
        <img
          className="card__img"
          src={imageUrl || DEFAULT_AVATAR}
          alt={title || "perfil"}
          onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
        />

        <div className="card__body">
          <header className="card__header">
            <div className="card__rating">
              <FaStar size={12} className="card__ratingIcon" />
              <span className="card__ratingText">{Number(rating).toFixed(1)}</span>
            </div>
            <h3 className="card__title">{title || "SIN NOMBRE"}</h3>
          </header>

          <p className="card__desc">{summary}</p>

          {(hasTags || hasInterestTags) && (
            <div className="card__tags">
              {hasTags && (
                <div className="card__tagGroup">
                  <span className="card__tagLabel">Ofrezco:</span>
                  <div className="card__chips">
                    {tags.map((tag) => (
                      <span className="card__chip" key={`offer-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasInterestTags && (
                <div className="card__tagGroup">
                  <span className="card__tagLabel">Busco:</span>
                  <div className="card__chips">
                    {interestTags.map((tag) => (
                      <span
                        className="card__chip card__chip--secondary"
                        key={`interest-${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card__actions">
            <button
              className="card__viewBtn"
              onClick={onViewProfile}
              style={{ fontWeight: "bold" }}
            >
              {authorName || "Ver perfil"}
            </button>

            <div className="card__actionsRight">
              <button
                className={`card__likePill ${isLiked ? "is-liked" : ""}`}
                onClick={toggleLike}
                aria-label={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <FaHeart className="card__likeIcon" />
              </button>
              <button
                type="button"
                className="card__toggleBtn"
                onClick={onToggle}
                disabled={!onToggle}
              >
                {expanded ? "Ocultar" : "Detalles"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {hasDetails && (
        <div className="card__details">
          <div className="card__section">
            <h4>Descripcion</h4>
            <p>{detailsText}</p>
          </div>
          {extraInfo &&
            (extraInfo.modalidad ||
              extraInfo.nivel ||
              extraInfo.ciudad ||
              extraInfo.region) && (
              <div className="card__section card__section--grid">
                {extraInfo.modalidad && (
                  <div>
                    <strong>Modalidad:</strong> {extraInfo.modalidad}
                  </div>
                )}
                {extraInfo.nivel && (
                  <div>
                    <strong>Nivel:</strong> {extraInfo.nivel}
                  </div>
                )}
                {extraInfo.ciudad && (
                  <div>
                    <strong>Ciudad:</strong> {extraInfo.ciudad}
                  </div>
                )}
                {extraInfo.region && (
                  <div>
                    <strong>Region:</strong> {extraInfo.region}
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </article>
  );
}

export default Card;
