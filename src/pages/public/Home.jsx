import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import { Newspaper, Login } from '@mui/icons-material';
import { obtenerNoticiasPublicadas } from '../../services/NoticiaService';

const Home = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNoticias = async () => {
            setLoading(true);
            setError(null);
            try {
                // RF-11: Obtener solo noticias en estado 'Publicado'
                const list = await obtenerNoticiasPublicadas();
                setNoticias(list);
            } catch (err) {
                setError("Error al cargar las noticias. Inténtalo más tarde.");
                console.error("Error al obtener noticias publicadas:", err);
            } finally {
                setLoading(false);
            }
        };

        loadNoticias();
    }, []);

    const formatFecha = (timestamp) => {
        if (!timestamp) return 'Fecha desconocida';
        // Firestore Timestamps pueden venir como objetos o Date si ya se convirtieron.
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
            {/* Header del Sitio Público */}
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
                        to="/login"
                        variant="outlined"
                        color="inherit"
                        startIcon={<Login />}
                        sx={{ borderColor: 'white', color: 'white' }}
                    >
                        Acceso Admin
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'medium', color: '#333' }}>
                    Últimas Noticias Publicadas
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : noticias.length === 0 ? (
                    <Alert severity="info">
                        No hay noticias publicadas en este momento.
                    </Alert>
                ) : (
                    <Grid container spacing={4}>
                        {noticias.map((noticia) => (
                            <Grid item key={noticia.id} xs={12} sm={6} md={4}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                                    {noticia.imagenUrl && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={noticia.imagenUrl}
                                            alt={noticia.titulo}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                            gutterBottom
                                        >
                                            {formatFecha(noticia.fechaActualizacion)} | Sección: {noticia.seccion}
                                        </Typography>
                                        <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                            {noticia.titulo}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {/* Mostrar solo un extracto del cuerpo */}
                                            {noticia.cuerpo.substring(0, 100) + (noticia.cuerpo.length > 100 ? '...' : '')}
                                        </Typography>

                                        {/* Enlace al detalle (RF-11) */}
                                        <Button
                                            component={RouterLink}
                                            to={`/noticia/${noticia.id}`}
                                            size="small"
                                            color="primary"
                                        >
                                            Leer Noticia Completa
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
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

export default Home;