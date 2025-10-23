// src/components/common/CreatePostForm.js
import React, { useState } from 'react';
import { createPublication } from '../../services/publications';
import { toast } from '../../utils/toast';

export default function CreatePostForm({ onPostCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('El título es obligatorio');
            return;
        }

        try {
            setLoading(true);
            console.log('📝 [CREATE POST FORM] Submitting:', { title, content, imageUrl });

            const result = await createPublication({
                title: title.trim(),
                content: content.trim() || null,
                imageUrl: imageUrl.trim() || null
            });

            console.log('✅ [CREATE POST FORM] Success:', result);
            toast.success(`Post "${result.title}" creado exitosamente`);

            // Reset form
            setTitle('');
            setContent('');
            setImageUrl('');

            // Notify parent component
            onPostCreated?.(result);

        } catch (error) {
            console.error('❌ [CREATE POST FORM] Error:', error);
            toast.error(`Error creando post: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            margin: '20px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Crear Nueva Publicación</h3>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        Título *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de tu publicación"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        Contenido
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe tu publicación..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            resize: 'vertical'
                        }}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        URL de Imagen (opcional)
                    </label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    style={{
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Creando...' : 'Crear Publicación'}
                </button>
            </form>
        </div>
    );
}
