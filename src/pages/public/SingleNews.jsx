import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { obtenerNoticiaPorId } from '../../services/NoticiaService';

const SingleNews = () => {
    const { id } = useParams(); // Obtiene el ID de la URL (/noticia/:id)
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const cargarNoticia = async () => {
            try {
                const data = await obtenerNoticiaPorId(id);

                // RF-11: Restricción de acceso. Solo mostrar si está "Publicado"
                if (data && data.estado === 'Publicado') {
                    setNoticia(data);
                } else {
                    // Si no está publicada o no existe, marcamos error
                    setError(true);
                }
            } catch (e) {
                setError(true);
                console.error("Error al cargar la noticia individual:", e);
            } finally {
                setLoading(false);
            }
        };

        cargarNoticia();
    }, [id]);

    if (loading) return <h2>Cargando noticia...</h2>;

    // Si no se encontró la noticia o no está publicada, redirige a una página 404
    if (error || !noticia) {
        // Si tienes un componente 404, puedes usarlo aquí, sino redirige al inicio.
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container" style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
            <header style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
                <h1 style={{ fontSize: '2.5em' }}>{noticia.titulo}</h1>
                <h2 style={{ fontSize: '1.5em', fontStyle: 'italic', color: '#555' }}>{noticia.subtitulo}</h2>
                <p style={{ fontSize: '0.9em', color: '#777' }}>
                    Autor: {noticia.autor} | Categoría: **{noticia.categoria}**
                </p>
            </header>

            {/* RF-06: Imagen de la noticia */}
            {noticia.imagenUrl && (
                <img
                    src={noticia.imagenUrl}
                    alt={noticia.titulo}
                    style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', marginBottom: '20px', borderRadius: '8px' }}
                />
            )}

            {/* RF-06: Contenido completo */}
            <div className="content" style={{ lineHeight: '1.8' }}>
                <p>{noticia.contenido}</p>
            </div>

            <p style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <Link to="/" style={{ color: '#007bff' }}>&larr; Volver a la página principal</Link>
            </p>
        </div>
    );
};

export default SingleNews;