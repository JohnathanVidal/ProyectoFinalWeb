import React, { useState, useEffect } from 'react';
import { crearNoticia, actualizarNoticia } from '../../../src/services/NoticiaService';

const NewsForm = ({ secciones, autorId, onSuccess, noticiaAEditar, setNoticiaAEditar }) => {
    const initialState = {
        titulo: '',
        subtitulo: '',
        contenido: '',
        categoria: '',
    };

    const [form, setForm] = useState(initialState);
    const [imagenFile, setImagenFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!noticiaAEditar;

    // Llenar el formulario si estamos en modo edición
    useEffect(() => {
        if (noticiaAEditar) {
            setForm({
                titulo: noticiaAEditar.titulo,
                subtitulo: noticiaAEditar.subtitulo,
                contenido: noticiaAEditar.contenido,
                categoria: noticiaAEditar.categoria,
            });
            // No cargamos la imagen previa, pero podemos mostrar un indicador
            setImagenFile(null);
        } else {
            setForm(initialState);
        }
    }, [noticiaAEditar]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImagenFile(e.target.files[0]);
    };

    const handleCancelEdit = () => {
        setNoticiaAEditar(null);
        setForm(initialState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                // Actualizar (RF-09)
                await actualizarNoticia(noticiaAEditar.id, {
                    ...form,
                    // Aquí puedes añadir lógica para cambiar la imagen si se subió un nuevo archivo
                });
                setNoticiaAEditar(null);
            } else {
                // Crear (RF-09, RF-06)
                await crearNoticia(form, imagenFile, autorId);
            }

            // Limpieza y éxito
            setForm(initialState);
            setImagenFile(null);
            onSuccess(); // Recargar la lista de noticias

        } catch (error) {
            console.error("Error al guardar la noticia:", error);
            alert('Error al guardar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #007bff', borderRadius: '5px' }}>
            <h3>{isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h3>
            <form onSubmit={handleSubmit}>
                <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" required /><br />
                <input name="subtitulo" value={form.subtitulo} onChange={handleChange} placeholder="Subtítulo o Bajante" required /><br />
                <textarea name="contenido" value={form.contenido} onChange={handleChange} placeholder="Contenido (RF-06)" required rows="5"></textarea><br />

                {/* RF-06: Categoría, usando el listado de secciones */}
                <select name="categoria" value={form.categoria} onChange={handleChange} required>
                    <option value="">Seleccione una Sección</option>
                    {secciones.map(sec => (
                        <option key={sec.id} value={sec.nombre}>{sec.nombre}</option>
                    ))}
                </select><br />

                {/* RF-06: Subida de imagen */}
                <input type="file" onChange={handleFileChange} accept="image/*" required={!isEditing && !form.imagenUrl} /><br />

                {loading ? (
                    <button disabled>Guardando...</button>
                ) : (
                    <>
                        <button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Noticia'}</button>
                        {isEditing && (
                            <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>Cancelar Edición</button>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};

export default NewsForm;