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
    Button,
    CircularProgress,
    Alert,
    Chip,
    Tooltip,
} from '@mui/material';
import { Newspaper, Login, AccessTime, Category } from '@mui/icons-material';
import { obtenerNoticiasPublicadas } from '../../services/NoticiaService';
import Footer from '../../Components/Footer/Footer';

// ====================================================================
// FUNCIÓN UNIVERSAL PARA OBTENER LA FECHA REAL DE UN TIMESTAMP DE FIRESTORE
// ====================================================================
const getDateValue = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000);
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) ? date : null;
};

const Home = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNoticias = async () => {
            setLoading(true);
            try {
                const data = await obtenerNoticiasPublicadas();

                data.sort((a, b) => {
                    const dateA = getDateValue(a.fechaCreacion) || 0;
                    const dateB = getDateValue(b.fechaCreacion) || 0;
                    return dateB - dateA;
                });
                setNoticias(data);

            } catch (err) {
                console.error("Error al cargar noticias:", err);
                setError("No se pudieron cargar las noticias.");
            } finally {
                setLoading(false);
            }
        };

        fetchNoticias();
    }, []);

    const formatFecha = (timestamp) => {
        const date = getDateValue(timestamp);
        if (!date) return 'Fecha Desconocida';

        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f9' }}>

            {/* Header del Sitio Público */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3, mb: 4, boxShadow: 3 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Newspaper sx={{ mr: 1, fontSize: 35 }} />
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            FuckNews VDL
                        </Typography>
                    </Box>
                    <Tooltip title="Acceso al panel de administración">
                        <Button
                            component={RouterLink}
                            to="/login"
                            color="inherit"
                            variant="outlined"
                            startIcon={<Login />}
                            sx={{ borderColor: 'white' }}
                        >
                            Acceso Admin
                        </Button>
                    </Tooltip>
                </Container>
            </Box>

            {/* Contenido principal - Usamos "lg" para dar más espacio horizontal */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, mb: 5 }}>

                <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'medium', color: '#00796b', borderBottom: '2px solid #e0e0e0', pb: 1 }}>
                    Últimas Noticias Publicadas
                </Typography>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                        <CircularProgress color="primary" />
                        <Typography variant="h6" sx={{ ml: 2, color: '#333' }}>Cargando noticias...</Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
                )}

                {!loading && noticias.length === 0 && !error && (
                    <Alert severity="info" sx={{ my: 4 }}>No hay noticias publicadas en este momento.</Alert>
                )}

                {/* CAMBIO CLAVE: Usamos Grid container con Flexbox para centrar y manejar las filas de 2 */}
                <Grid
                    container
                    spacing={4}
                    justifyContent="center" // Centra las tarjetas horizontalmente
                    sx={{
                        // Forzamos el comportamiento de 2 por fila con ancho fijo
                        '& > .MuiGrid-item': {
                            maxWidth: { xs: '100%', sm: '48%', md: '380px' }, // Limita el ancho en escritorio
                            flexBasis: { xs: '100%', sm: '48%', md: '380px' } // Limita el ancho en escritorio
                        }
                    }}
                >
                    {noticias.map((noticia) => (
                        // No necesitamos md={6} si forzamos el ancho en el padre
                        <Grid item key={noticia.id}>
                            <Card
                                elevation={6}
                                sx={{
                                    // REQUERIMIENTO: Ancho Fijo en píxeles para todas las tarjetas
                                    width: '380px',
                                    // REQUERIMIENTO: Altura Fija en píxeles para todas las tarjetas
                                    height: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                                    },
                                    // Aseguramos que la columna de contenido use el espacio restante
                                    '& .MuiCardContent-root': {
                                        flexGrow: 1,
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="160" // Altura fija para la imagen
                                    image={noticia.imagenUrl || 'https://placehold.co/380x160/CCCCCC/333333?text=Sin+Imagen'}
                                    alt={noticia.titulo}
                                    sx={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/380x160/CCCCCC/333333?text=Sin+Imagen';
                                    }}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                                    <Chip
                                        icon={<Category fontSize="small" />}
                                        label={noticia.categoria || 'Sin Categoría'}
                                        size="small"
                                        color="primary"
                                        sx={{ mb: 1, bgcolor: '#00796b', color: 'white', fontWeight: 'bold' }}
                                    />
                                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.05rem', lineHeight: '1.4' }}>
                                        {noticia.titulo}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2, // Limitamos a 2 líneas para uniformidad
                                        WebkitBoxOrient: 'vertical',
                                        fontSize: '0.85rem',
                                        flexGrow: 1 // Permite que el resumen tome el espacio que necesita
                                    }}>
                                        {noticia.resumen}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                                        {formatFecha(noticia.fechaCreacion)}
                                    </Typography>
                                    <Button
                                        component={RouterLink}
                                        to={`/noticia/${noticia.id}`}
                                        size="small"
                                        variant="contained"
                                        sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
                                    >
                                        Leer
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Container>

            <Footer />

        </Box>
    );
};

export default Home;