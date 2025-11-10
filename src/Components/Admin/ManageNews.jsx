import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/ContextoAutenticacion';
import { Link as RouterLink } from 'react-router-dom';
import {
    crearNoticia,
    obtenerNoticiasAdministracion,
    actualizarNoticia,
    eliminarNoticia,
    obtenerNoticiasPendientesPublicacion,
} from '../../services/NoticiaService';
import NewsForm from '../../Components/admin/NewsForm';
import NewsTable from '../../Components/admin/NewsTable';
import { Container, Typography, Alert, Box, Button } from '@mui/material'; // Agregamos Button para el header
import { Article, KeyboardArrowLeft } from '@mui/icons-material'; // Iconos para el header


const ManageNews = () => {

    const { userData, isEditor } = useAuth();

    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingNoticia, setEditingNoticia] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Estado para gestionar la cola de revisión (solo para Editores)
    const [colaRevision, setColaRevision] = useState([]);


    const loadNoticias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Se asume que obtenerNoticiasAdministracion usa userData.rol y userData.uid correctamente
            const fetchedNoticias = await obtenerNoticiasAdministracion(userData.rol, userData.uid);
            setNoticias(fetchedNoticias);
        } catch (err) {
            console.error("Error al cargar noticias:", err);
            setError("Fallo al cargar las noticias. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [userData]);


    const loadColaRevision = useCallback(async () => {
        if (!isEditor) return;
        try {
            const fetchedCola = await obtenerNoticiasPendientesPublicacion();
            setColaRevision(fetchedCola);
        } catch (err) {
            console.error("Error al cargar cola de revisión:", err);
        }
    }, [isEditor]);


    useEffect(() => {
        if (userData) {
            loadNoticias();
            loadColaRevision();
        }
    }, [userData, loadNoticias, loadColaRevision]);


    const handleSave = async (data, imagenFile, currentPublicId) => {
        try {
            setLoading(true);
            setSuccessMessage(null);

            if (editingNoticia) {
                // Actualizar
                await actualizarNoticia(editingNoticia.id, data, imagenFile, currentPublicId);
                setSuccessMessage("Noticia actualizada con éxito.");
                setEditingNoticia(null);
            } else {
                // Crear (se asegura que el campo autor en Firestore sea el UID)
                await crearNoticia(data, imagenFile, userData.uid);
                setSuccessMessage("Noticia creada con éxito. Estado inicial: Edición.");
            }

        } catch (err) {
            console.error("Error al guardar noticia:", err);
            setError(err.message || "Fallo al guardar la noticia.");
        } finally {
            // Actualizar ambas listas tras la operación
            await loadNoticias();
            await loadColaRevision();
            setLoading(false);
        }
    };


    const handleDelete = async (id, imagenPublicId) => {
        if (window.confirm("¿Está seguro de que desea eliminar esta noticia?")) {
            try {
                await eliminarNoticia(id, imagenPublicId);
                setSuccessMessage("Noticia eliminada con éxito.");
                // Actualizar ambas listas tras la eliminación
                await loadNoticias();
                await loadColaRevision();
            } catch (err) {
                console.error("Error al eliminar noticia:", err);
                setError("Fallo al eliminar la noticia.");
            }
        }
    };


    const handleEdit = (noticia) => {
        setEditingNoticia(noticia);
        window.scrollTo(0, 0); // Desplazar al formulario
    };


    const handleCancelEdit = () => {
        setEditingNoticia(null);
    };


    return (
        // Utilizamos el layout del Admin Dashboard (Header y Footer en Box)
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f9' }}>

            {/* Header del Admin: Gestión de Noticias */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3, mb: 4, boxShadow: 3 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Article sx={{ mr: 1, fontSize: 35 }} />
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            Gestión de Contenido
                        </Typography>
                    </Box>
                    <Button
                        component={RouterLink}
                        to="/admin"
                        color="inherit"
                        variant="outlined"
                        startIcon={<KeyboardArrowLeft />}
                        sx={{ borderColor: 'white' }}
                    >
                        Volver al Dashboard
                    </Button>
                </Container>
            </Box>

            {/* Contenido Principal de Gestión */}
            <Container maxWidth="xl" sx={{ flexGrow: 1, mb: 4 }}>
                <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3 }}>

                    {/* Título Principal */}
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            borderBottom: '2px solid #e0e0e0',
                            pb: 1,
                            color: '#1a237e',
                            mb: 3
                        }}
                    >
                        {editingNoticia ? 'Editar Noticia' : 'Crear Nueva Noticia'}
                        <span style={{ color: '#00796b', fontSize: '1rem', marginLeft: '10px' }}>
                            ({userData?.rol})
                        </span>
                    </Typography>

                    {/* Mensajes de Estado */}
                    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {/* Formulario de Creación/Edición */}
                    <NewsForm
                        onSave={handleSave}
                        onCancelEdit={handleCancelEdit}
                        editingNoticia={editingNoticia}
                        loading={loading}
                        isEditor={isEditor}
                    />


                    {/* Cola de revisión (solo para Editores) - Título Limpio */}
                    {isEditor && (
                        <Box sx={{ mt: 5, mb: 5 }}>
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{
                                    fontWeight: '600',
                                    color: '#d32f2f', // Usamos un color de advertencia/peligro para la revisión
                                    borderBottom: '1px dashed #d32f2f',
                                    pb: 1
                                }}
                            >
                                🚨 Cola de Noticias Listas para Publicación
                            </Typography>
                            <NewsTable
                                noticias={colaRevision}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                loading={loading}
                                isEditor={isEditor}
                                showQueue={true} // Marca para mostrar la tabla como cola
                                refreshData={loadColaRevision} // Función para refrescar la cola
                            />
                            {colaRevision.length === 0 && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No hay noticias en estado 'Terminado' pendientes de revisión.
                                </Alert>
                            )}
                        </Box>
                    )}


                    {/* Tabla General de Noticias - Título Limpio */}
                    <Box sx={{ mt: 5 }}>
                        <Typography
                            variant="h5"
                            component="h2"
                            gutterBottom
                            sx={{
                                fontWeight: '600',
                                color: '#1a237e',
                                borderBottom: '1px solid #1a237e',
                                pb: 1
                            }}
                        >
                            📋 {isEditor ? 'Todas las Noticias' : 'Mis Noticias'}
                        </Typography>
                        <NewsTable
                            noticias={noticias}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            loading={loading}
                            isEditor={isEditor}
                            refreshData={loadNoticias}
                        />
                    </Box>


                </Box>
            </Container>

            {/* Footer Admin */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 2, textAlign: 'center', mt: 'auto' }}>
                <Typography variant="body2">
                    Panel de Administración | FuckNews VDL | Versión 1.0
                </Typography>
            </Box>
        </Box>
    );
};

export default ManageNews;