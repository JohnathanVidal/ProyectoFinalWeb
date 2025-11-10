import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Button,
    Alert,
    Chip,
    Tooltip,
} from '@mui/material';
import { Newspaper, Login, AccessTime, Person, ArrowBack } from '@mui/icons-material';
import { obtenerNoticiaPorId } from '../../services/NoticiaService';
import Footer from '../../Components/Footer/Footer';

// ====================================================================
// FUNCIÓN UNIVERSAL PARA OBTENER LA FECHA REAL DE UN TIMESTAMP DE FIRESTORE
// ====================================================================
const getDateValue = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    if (typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000);
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
        return date;
    }
    return null;
};

const NoticiaDetalle = () => {
    const { id } = useParams();
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNoticia = useCallback(async () => {
        if (!id) {
            setError("ID de noticia no proporcionado.");
            setLoading(false);
            return;
        }
        try {
            const data = await obtenerNoticiaPorId(id);
            if (data && data.estado === 'Publicado') {
                setNoticia(data);
            } else {
                setError("La noticia no existe o no está publicada.");
            }
        } catch (err) {
            console.error("Error al cargar la noticia:", err);
            setError("Error al cargar la noticia. Inténtelo más tarde.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchNoticia();
    }, [fetchNoticia]);

    const formatFecha = (timestamp) => {
        const date = getDateValue(timestamp);
        if (!date) return 'Fecha Desconocida';

        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // --- Renderizado de Carga y Error ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ mt: 2, color: '#333' }}>Cargando noticia...</Typography>
            </Box>
        );
    }
    if (error || !noticia) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f9' }}>
                <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3, mb: 4, boxShadow: 3 }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Newspaper sx={{ mr: 1, fontSize: 35 }} />
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                FuckNews VDL
                            </Typography>
                        </Box>
                        <Tooltip title="Acceso al panel de administración">
                            <Button component={RouterLink} to="/login" color="inherit" variant="outlined" startIcon={<Login />} sx={{ borderColor: 'white' }}>
                                Acceso Admin
                            </Button>
                        </Tooltip>
                    </Container>
                </Box>
                <Container maxWidth="md" sx={{ flexGrow: 1, my: 4 }}>
                    <Alert severity="error">{error || 'Noticia no disponible.'}</Alert>
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button component={RouterLink} to="/" variant="contained" startIcon={<ArrowBack />} sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}>
                            Volver al Inicio
                        </Button>
                    </Box>
                </Container>
                <Footer />
            </Box>
        );
    }

    // --- Renderizado de la Noticia ---
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f9' }}>
            {/* Header del sitio */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3, mb: 4, boxShadow: 3 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Newspaper sx={{ mr: 1, fontSize: 35 }} />
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            FuckNews VDL
                        </Typography>
                    </Box>
                    <Tooltip title="Volver al listado de noticias">
                        <Button
                            component={RouterLink}
                            to="/"
                            variant="outlined"
                            color="inherit"
                            startIcon={<ArrowBack />}
                            sx={{ borderColor: 'white' }}
                        >
                            Listado
                        </Button>
                    </Tooltip>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ flexGrow: 1 }}>
                <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>

                    {/* Título */}
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
                        {noticia.titulo}
                    </Typography>

                    {/* CAMBIO CLAVE: Subtítulo ahora usa el estilo de la línea verde (Blockquote) */}
                    {noticia.subtitulo && (
                        <Typography
                            variant="h6"
                            component="p"
                            sx={{
                                fontStyle: 'italic',
                                color: '#37474f',
                                borderLeft: '3px solid #00796b', // Línea verde
                                pl: 2,
                                py: 1,
                                mb: 4,
                                fontWeight: 'regular' // Quitamos la negrita
                            }}
                        >
                            {noticia.subtitulo} {/* Quitamos los ** */}
                        </Typography>
                    )}

                    {/* Metadatos */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: 'text.secondary', mb: 3 }}>
                        <Chip
                            icon={<Person fontSize="small" />}
                            label={noticia.autor || 'Anónimo'}
                            size="small"
                        />
                        <Chip
                            icon={<AccessTime fontSize="small" />}
                            label={`Publicado el: ${formatFecha(noticia.fechaCreacion)}`}
                            size="small"
                        />
                        <Chip
                            label={noticia.categoria || 'Sin Categoría'}
                            size="small"
                            color="primary"
                            sx={{ bgcolor: '#00796b', color: 'white', fontWeight: 'bold' }}
                        />
                    </Box>

                    {/* Resumen (Mantenemos, pero sin el estilo destacado si el subtítulo lo usa) */}
                    {noticia.resumen && (
                        <Typography variant="body1" component="p" sx={{ mb: 3, color: 'text.primary' }}>
                            **Resumen:** {noticia.resumen}
                        </Typography>
                    )}

                    {/* Imagen Principal */}
                    {noticia.imagenUrl && (
                        <Box sx={{ mb: 4, borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
                            <img
                                src={noticia.imagenUrl}
                                alt={noticia.descripcionImagen || noticia.titulo}
                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/800x600/CCCCCC/333333?text=Imagen+No+Disponible';
                                }}
                            />
                            {noticia.descripcionImagen && (
                                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
                                    {noticia.descripcionImagen}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Contenido Principal */}
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                    >
                        {noticia.contenido}
                    </Typography>
                </Paper>

                <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Button
                        component={RouterLink}
                        to="/"
                        variant="contained"
                        startIcon={<ArrowBack />}
                        sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
                    >
                        Ver todas las noticias
                    </Button>
                </Box>
            </Container>
            <Footer />
        </Box>
    );
};

export default NoticiaDetalle;