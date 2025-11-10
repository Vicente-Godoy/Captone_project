// src/components/common/ImageUploader.js
import React, { useState, useRef } from 'react';
import { useImageUpload } from '../../services/imageUpload';

export default function ImageUploader({
  onImageUploaded,
  path = 'posts',
  maxSize = 20,
  accept = "image/jpeg,image/png,image/webp",
  preview = true,
  buttonText = "Seleccionar Imagen"
}) {
  const { upload, uploading, progress, imageUrl, error, reset } = useImageUpload(path);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`La imagen es muy grande. Máximo ${maxSize}MB`);
      return;
    }

    // Mostrar preview
    if (preview) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }

    // Subir imagen
    try {
      const url = await upload(file);
      if (onImageUploaded) {
        onImageUploaded(url);
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Área de vista previa */}
      {(previewUrl || imageUrl) && (
        <div style={{
          position: 'relative',
          width: '100%',
          marginBottom: '16px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <img
            src={previewUrl || imageUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
          
          {/* Botón de eliminar */}
          {!uploading && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              x
            </button>
          )}
        </div>
      )}

      {/* Barra de progreso */}
      {uploading && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#007bff',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{
            textAlign: 'center',
            marginTop: '8px',
            color: '#666',
            fontSize: '14px'
          }}>
            Subiendo... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {/* Botón de selección */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: uploading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {uploading ? 'Subiendo...' : buttonText}
      </button>

      {/* Información */}
      <p
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}
      >
        Tamaño máximo: {maxSize}MB - Formatos: JPG, PNG, WEBP
      </p>
    </div>
  );
}

