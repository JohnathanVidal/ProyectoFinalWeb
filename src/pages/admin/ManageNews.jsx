import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/ContextoAutenticacion';
import {
    obtenerNoticiasAdministracion,
    eliminarNoticia,
    cambiarEstadoPublicacion,
    marcarComoTerminado
} from '../../services/NoticiaService';
import { obtenerSecciones } from '../../services/SeccionService';
import NewsForm from '../../Components/News/NewsForm'; // Lo crearemos en el siguiente punto
import NewsTable from '../../Components/News/NewsTable'; // Lo crearemos en el siguiente punto

const ManageNews = () => {
    const { user, userData, loading: authLoading, isEditor } = useAuth();
    const [noticias, setNoticias] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noticiaAEditar, setNoticiaAEditar] = useState(null); // Para el modo edición

    // Cargar datos (Noticias y Secciones)
    const cargarDatos = async () => {
        if (!user || !userData) return;

        setLoading(true);
        try {
            // Carga de noticias filtrada por rol (RF-05)
            const newsData = await obtenerNoticiasAdministracion(userData.rol, user.uid);
            setNoticias(newsData);

            // Carga de secciones para el formulario
            const sectionsData = await obtenerSecciones();
            setSecciones(sectionsData);

        } catch (e) {
            console.error("Error al cargar datos:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            cargarDatos();
        }
    }, [authLoading, user, userData]);

    // Funciones de acción

    // RF-09: Eliminar
    const handleEliminar = async (noticiaId, storagePath) => {
        if (!window.confirm("¿Confirmas la eliminación permanente de esta noticia?")) return;
        try {
            await eliminarNoticia(noticiaId, storagePath);
            await cargarDatos(); // Recargar lista
        } catch (error) {
            console.error("Fallo al eliminar:", error);
            alert("Error al eliminar la noticia.");
        }
    };

    // RF-07: Editor cambia estado (Publicado/Desactivado)
    const handleCambiarEstadoEditor = async (id, estado) => {
        if (!isEditor) return;
        try {
            await cambiarEstadoPublicacion(id, estado);
            await cargarDatos(); // Recargar lista
        } catch (error) {
            console.error("Fallo al cambiar estado:", error);
        }
    };

    // RF-07: Reportero marca como Terminado
    const handleMarcarTerminado = async (id) => {
        try {
            await marcarComoTerminado(id);
            await cargarDatos(); // Recargar lista
        } catch (error) {
            console.error("Fallo al marcar como terminado:", error);
        }
    };

    if (loading) {
        return <div>Cargando panel de gestión de noticias...</div>;
    }

    // El Dashboard es accesible por ambos roles, así que no hay restricción de acceso total aquí.

    return (
        <div className="container">
            <h2>Gestión de Noticias - Rol: **{userData.rol}**</h2>

            {/* Formulario de Creación/Edición */}
            <NewsForm
                secciones={secciones}
                autorId={user.uid}
                onSuccess={cargarDatos}
                noticiaAEditar={noticiaAEditar}
                setNoticiaAEditar={setNoticiaAEditar}
            />

            <h3>Listado de Noticias ({noticias.length})</h3>

            {/* Tabla de Listado (Implementada en el siguiente punto) */}
            <NewsTable
                noticias={noticias}
                isEditor={isEditor}
                onEdit={setNoticiaAEditar}
                onDelete={handleEliminar}
                onPublish={handleCambiarEstadoEditor}
                onFinish={handleMarcarTerminado}
            />
        </div>
    );
};

export default ManageNews;