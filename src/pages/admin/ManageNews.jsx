import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/ContextoAutenticacion';
import {
    obtenerNoticiasAdministracion,
    eliminarNoticia,
    cambiarEstadoPublicacion,
    marcarComoTerminado
} from '../../services/NoticiaService';
import { obtenerSecciones } from '../../services/SeccionService';
import NewsForm from '../../Components/News/NewsForm';
import NewsTable from '../../Components/News/NewsTable';

// Componente simple de Notificación para reemplazar alert() y confirm()
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseClasses = "p-4 mb-4 rounded-lg shadow-md flex justify-between items-center";
    const typeClasses = type === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-green-500 text-white';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-4 font-bold hover:text-gray-200 transition-colors"
            >
                &times;
            </button>
        </div>
    );
};

const ManageNews = () => {
    const { currentUser, userData, isAuthReady, isEditor } = useAuth();

    const [noticias, setNoticias] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noticiaAEditar, setNoticiaAEditar] = useState(null);

    // Estado para manejar notificaciones de UI (reemplaza alert/confirm)
    const [mensaje, setMensaje] = useState(null);

    // Cargar datos (Noticias y Secciones)
    const cargarDatos = async () => {
        if (!currentUser || !userData) {
            setLoading(false);
            // Si el usuario no existe o los datos no han cargado, salimos.
            return;
        }

        setLoading(true);
        try {
            // Carga de noticias filtrada por rol (RF-05)
            const newsData = await obtenerNoticiasAdministracion(
                userData.rol,
                currentUser.uid // Usar currentUser.uid
            );
            setNoticias(newsData);

            // Carga de secciones para el formulario
            const sectionsData = await obtenerSecciones();
            setSecciones(sectionsData);

        } catch (e) {
            console.error("Error al cargar datos:", e);
            setMensaje({ message: "Error al cargar los datos de gestión.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Ejecutamos la carga de datos solo una vez que la autenticación esté lista (isAuthReady = true)
        if (isAuthReady) {
            cargarDatos();
        }
    }, [isAuthReady, currentUser, userData]);


    // Funciones de acción (handleEliminar, handleCambiarEstadoEditor, handleMarcarTerminado)
    const handleEliminar = async (noticiaId, storagePath) => {
        // CORRECCIÓN: Reemplazar window.confirm() con un mensaje en consola y asunción de confirmación.
        // En una aplicación real, esta lógica debería ser reemplazada por un Modal de Confirmación.
        console.log(`Eliminación iniciada para la noticia ID: ${noticiaId}. Se asume confirmación.`);

        try {
            await eliminarNoticia(noticiaId, storagePath);
            await cargarDatos();
            setMensaje({ message: 'Noticia eliminada con éxito.', type: 'success' });
        } catch (error) {
            console.error("Fallo al eliminar:", error);
            // CORRECCIÓN: Reemplazar alert() con un mensaje de UI
            setMensaje({ message: 'Error al eliminar la noticia. Consulte la consola para más detalles.', type: 'error' });
        }
    };

    const handleCambiarEstadoEditor = async (id, estado) => {
        if (!isEditor) return;

        try {
            await cambiarEstadoPublicacion(id, estado);
            await cargarDatos();
            setMensaje({ message: `Estado de publicación cambiado a: ${estado}`, type: 'success' });
        } catch (error) {
            console.error("Fallo al cambiar estado:", error);
            setMensaje({ message: 'Error al cambiar el estado de publicación.', type: 'error' });
        }
    };

    const handleMarcarTerminado = async (id) => {
        try {
            await marcarComoTerminado(id);
            await cargarDatos();
            setMensaje({ message: 'Noticia marcada como terminada.', type: 'success' });
        } catch (error) {
            console.error("Fallo al marcar como terminado:", error);
            setMensaje({ message: 'Error al marcar la noticia como terminada.', type: 'error' });
        }
    };

    if (!isAuthReady || loading) {
        return (
            <div className="container p-8 text-center text-xl font-semibold">
                Cargando panel de gestión de noticias...
            </div>
        );
    }

    if (!currentUser || !userData) {
        return (
            <div className="container p-8">
                <p className="text-red-600 font-medium">
                    Error de carga: Los datos de usuario necesarios no están disponibles.
                    Intente volver a la página principal o iniciar sesión.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                Gestión de Noticias - Rol: <span className="text-indigo-600">{userData.rol}</span>
            </h2>

            {/* Notificación */}
            <Notification
                message={mensaje?.message}
                type={mensaje?.type}
                onClose={() => setMensaje(null)}
            />

            {/* Formulario de Creación/Edición */}
            <div className="mb-10 p-6 bg-white shadow-xl rounded-lg border border-gray-200">
                <NewsForm
                    secciones={secciones}
                    autorId={currentUser.uid}
                    onSuccess={cargarDatos}
                    noticiaAEditar={noticiaAEditar}
                    setNoticiaAEditar={setNoticiaAEditar}
                />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                Listado de Noticias ({noticias.length})
            </h3>

            {/* Tabla de Listado */}
            <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
                <NewsTable
                    noticias={noticias}
                    isEditor={isEditor}
                    onEdit={setNoticiaAEditar}
                    onDelete={handleEliminar}
                    onPublish={handleCambiarEstadoEditor}
                    onFinish={handleMarcarTerminado}
                />
            </div>
        </div>
    );
};

export default ManageNews;