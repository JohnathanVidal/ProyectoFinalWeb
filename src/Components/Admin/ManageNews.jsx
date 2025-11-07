import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Publish as PublishIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import NewsFormModal from '../../Components/Admin/NewsFormModal'; // Modal que acabamos de crear
import {
    obtenerNoticiasAdministracion,
    eliminarNoticia,
    marcarComoTerminado,
    cambiarEstadoPublicacion
} from '../../services/NoticiaService';
import { useAuth } from '../../Context/ContextoAutenticacion';

// Mapeo de estados para estilos visuales
const ESTADO_COLORES = {
    'Edición': 'info',
    'Terminado': 'warning',
    'Pendiente': 'secondary', // Si se introduce un estado 'Pendiente'
    'Publicado': 'success',
    'Desactivado': 'error',
};

const ManageNews = () => {
    const { userData, isAuthReady } = useAuth();
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Estado para el modal de formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noticiaToEditId, setNoticiaToEditId] = useState(null);

    // Función principal para cargar las noticias (RF-05)
    const loadNoticias = useCallback(async () => {
        if (!userData || !userData.rol || !isAuthReady) return;

        setLoading(true);
        setError(null);
        try {
            const list = await obtenerNoticiasAdministracion(userData.rol, userData.uid);
            setNoticias(list);
        } catch (err) {
            setError("Error al cargar las noticias. Revise la consola.");
        } finally {
            setLoading(false);
        }
    }, [userData, isAuthReady]);

    // Cargar noticias al iniciar o cuando los datos del usuario estén listos
    useEffect(() => {
        if (isAuthReady) {
            loadNoticias();
        }
    }, [isAuthReady, loadNoticias]);

    // Manejadores del Modal
    const handleOpenCreate = () => {
        setNoticiaToEditId(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (noticiaId) => {
        setNoticiaToEditId(noticiaId);
        setIsModalOpen(true);
    };

    const handleModalSuccess = (message) => {
        setSuccessMessage(message);
        loadNoticias(); // Recargar la lista después de crear/editar
    };

    // Manejador de Eliminación (RF-09)
    const handleDelete = async (id, imageStoragePath) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta noticia? Esta acción es irreversible y también borrará la imagen asociada.")) {
            setLoading(true);
            try {
                // Llama al servicio que maneja tanto Firestore como Storage
                await eliminarNoticia(id, imageStoragePath);
                setSuccessMessage("Noticia eliminada correctamente.");
                loadNoticias();
            } catch (err) {
                setError("Error al eliminar la noticia. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        }
    };

    // Manejadores de Estado (RF-07)
    const handleMarcarTerminado = async (id) => {
        try {
            await marcarComoTerminado(id);
            setSuccessMessage("Noticia marcada como 'Terminado'. Lista para revisión.");
            loadNoticias();
        } catch (err) {
            setError("Fallo al cambiar el estado.");
        }
    };

    const handleCambiarPublicacion = async (id, nuevoEstado) => {
        try {
            await cambiarEstadoPublicacion(id, nuevoEstado);
            setSuccessMessage(`Estado de publicación cambiado a '${nuevoEstado}'.`);
            loadNoticias();
        } catch (err) {
            setError("Fallo al cambiar el estado de publicación.");
        }
    };

    const isEditor = userData && userData.rol === 'Editor';
    const isReportero = userData && userData.rol === 'Reportero';

    if (!isAuthReady || loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Cargando noticias...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    📰 Gestión de Noticias (RF-06)
                </Typography>

                {/* Botón de Creación (Visible solo para Reportero, RF-06) */}
                {isReportero && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                    >
                        Crear Nueva Noticia
                    </Button>
                )}
            </Box>

            {/* Mensajes de feedback */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

            {/* Mensaje de datos vacíos */}
            {noticias.length === 0 ? (
                <Alert severity="info">
                    No hay noticias disponibles en esta vista.
                </Alert>
            ) : (
                <Paper elevation={3}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Título</TableCell>
                                    <TableCell>Sección</TableCell>
                                    <TableCell>Autor</TableCell>
                                    <TableCell>Estado (RF-07)</TableCell>
                                    <TableCell>Última Act.</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {noticias.map((noticia) => (
                                    <TableRow key={noticia.id} hover>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{noticia.titulo}</TableCell>
                                        <TableCell>{noticia.seccion || 'N/A'}</TableCell>
                                        <TableCell>{noticia.autor}</TableCell>

                                        {/* Columna de Estado */}
                                        <TableCell>
                                            <Alert
                                                severity={ESTADO_COLORES[noticia.estado] || 'default'}
                                                sx={{ py: 0, px: 1, textTransform: 'capitalize' }}
                                            >
                                                {noticia.estado}
                                            </Alert>
                                        </TableCell>

                                        <TableCell>{new Date(noticia.fechaActualizacion).toLocaleDateString()}</TableCell>

                                        {/* Columna de Acciones */}
                                        <TableCell align="center" sx={{ minWidth: '200px' }}>
                                            {/* Edición (RF-06) - Disponible en estado 'Edición' y 'Desactivado' */}
                                            {(noticia.estado === 'Edición' || noticia.estado === 'Desactivado') && (
                                                <Tooltip title="Editar Noticia">
                                                    <IconButton color="primary" onClick={() => handleOpenEdit(noticia.id)} size="small">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {/* Marcar Terminado (RF-07) - Solo Reportero, solo si está en 'Edición' */}
                                            {isReportero && noticia.estado === 'Edición' && (
                                                <Tooltip title="Enviar a Revisión (Terminado)">
                                                    <IconButton color="warning" onClick={() => handleMarcarTerminado(noticia.id)} size="small">
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {/* Publicar/Desactivar (RF-07) - Solo Editor, si está en 'Terminado' o 'Publicado'/'Desactivado' */}
                                            {isEditor && (noticia.estado === 'Terminado' || noticia.estado === 'Publicado' || noticia.estado === 'Desactivado') && (
                                                <FormControl size="small" sx={{ minWidth: 100, ml: 1 }}>
                                                    <Select
                                                        value={noticia.estado}
                                                        onChange={(e) => handleCambiarPublicacion(noticia.id, e.target.value)}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="Terminado" disabled>Terminado</MenuItem>
                                                        <MenuItem value="Publicado">Publicar</MenuItem>
                                                        <MenuItem value="Desactivado">Desactivar</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}

                                            {/* Eliminar (RF-09) - Disponible para Reportero (solo sus noticias) y Editor */}
                                            <Tooltip title="Eliminar Noticia y su Imagen">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(noticia.id, noticia.imagenStoragePath)}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Modal de Creación/Edición */}
            <NewsFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                noticiaId={noticiaToEditId}
            />
        </Container>
    );
};

export default ManageNews;