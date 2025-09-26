import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./foto.css";

function Foto() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [imagen, setImagen] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagen(url);
  };

  const onChange = (e) => handleFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="foto-page">
      {/* Header rojo con flecha y título */}
      <header className="foto-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
        <h1 className="foto-title">FOTO DE PERFIL</h1>
      </header>

      <main className="foto-main">
        <p className="foto-sub">ESCOGE UNA FOTO DE TU GALERÍA</p>

        {/* Dropzone */}
        <div
          className={`dropzone ${isDragOver ? "over" : ""}`}
          onClick={openPicker}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          {/* Input oculto */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            hidden
          />

          {/* Contenido: plus o preview */}
          {!imagen ? (
            <div className="plus">
              <span>+</span>
            </div>
          ) : (
            <img className="preview" src={imagen} alt="Vista previa" />
          )}
        </div>

        <button
          className="btn-pill danger"
          onClick={() => {
            console.log("Imagen seleccionada:", imagen);
            navigate("/"); // vuelve al login
          }}
        >
          TERMINAR
        </button>
      </main>
    </div>
  );
}

export default Foto;
