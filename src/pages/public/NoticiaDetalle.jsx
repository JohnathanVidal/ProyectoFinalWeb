import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Button
} from '@mui/material';
import { ArrowBack, Newspaper } from '@mui/icons-material';
import { obtenerNoticiaPorId } from '../../services/NoticiaService';

const NoticiaDetalle = () => {
    const { id } = useParams(); // Obtiene el parámetro ID de la URL
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadNoticia = useCallback(async () => {
        if (!id) {
            setError("ID de noticia no proporcionado.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await obtenerNoticiaPorId(id);

            // Verificación adicional: La noticia debe estar publicada para ser visible al público
            if (data && data.estado === 'Publicado') {
                // Convertir fechas si son Firestore Timestamps
                const fechaPublicacion = data.fechaActualizacion.toDate ? data.fechaActualizacion.toDate() : new Date(data.fechaActualizacion);

                setNoticia({
                    ...data,
                    fechaPublicacion: fechaPublicacion.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                });
            } else {
                setNoticia(null);
                setError("La noticia no existe o aún no ha sido publicada.");
            }
        } catch (err) {
            setError("Error al cargar los detalles de la noticia.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadNoticia();
    }, [loadNoticia]);

    // --- Renderizado de estados ---

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Cargando noticia...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
                <Box sx={{ mt: 3 }}>
                    <Button component={RouterLink} to="/" startIcon={<ArrowBack />} variant="outlined">
                        Volver al inicio
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!noticia) {
        return (
            <Container maxWidth="md" sx={{ mt: 5 }}>
                <Alert severity="warning">
                    No se encontró la noticia o no está disponible públicamente.
                </Alert>
                <Box sx={{ mt: 3 }}>
                    <Button component={RouterLink} to="/" startIcon={<ArrowBack />} variant="outlined">
                        Volver al inicio
                    </Button>
                </Box>
            </Container>
        );
    }

    // --- Renderizado de la Noticia ---

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
            {/* Header del sitio */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mb: 4 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Newspaper sx={{ mr: 1, fontSize: 35 }} />
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            Mi CMS
                        </Typography>
                    </Box>
                    <Button
                        component={RouterLink}
                        to="/"
                        variant="outlined"
                        color="inherit"
                        startIcon={<ArrowBack />}
                        sx={{ borderColor: 'white', color: 'white' }}
                    >
                        Volver al Listado
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        {noticia.titulo}
                    </Typography>

                    <Box sx={{ color: 'text.secondary', mb: 3 }}>
                        <Typography variant="subtitle1">
                            Publicado: {noticia.fechaPublicacion}
                        </Typography>
                        <Typography variant="subtitle2">
                            Sección: {noticia.seccion} | Autor: {noticia.autor}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {noticia.imagenUrl && (
                        <Box sx={{ mb: 4, maxHeight: 400, overflow: 'hidden', borderRadius: 1 }}>
                            <img
                                src={noticia.imagenUrl}
                                alt={noticia.titulo}
                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                            />
                        </Box>
                    )}

                    <Typography
                        variant="body1"
                        component="div"
                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                    >
                        {/* El 'whiteSpace: pre-wrap' respeta los saltos de línea ingresados por el Reportero */}
                        {noticia.cuerpo}
                    </Typography>

                </Paper>

                <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Button component={RouterLink} to="/" startIcon={<ArrowBack />} variant="contained" size="large">
                        Ver todas las noticias
                    </Button>
                </Box>
            </Container>

            {/* Footer simple */}
            <Box sx={{ bgcolor: '#333', color: 'white', py: 3, mt: 5, textAlign: 'center' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2">
                        © {new Date().getFullYear()} Mi CMS. Todos los derechos reservados.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default NoticiaDetalle;