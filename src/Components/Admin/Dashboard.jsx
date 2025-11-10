import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper
} from '@mui/material';
import { Home, Newspaper, Category } from '@mui/icons-material';
import { useAuth } from '../../Context/ContextoAutenticacion';

const Dashboard = () => {

    const { userData } = useAuth();

    const getPermissions = (rol) => {
        if (rol === 'Editor') {
            return 'Gestionar Secciones, y Publicar/Desactivar/Eliminar noticias.';
        }
        if (rol === 'Reportero') {
            return 'Crear, Editar, y Marcar como Terminado tus noticias.';
        }
        return 'No tienes permisos definidos.';
    };

    const userRol = userData?.rol || 'No Definido';
    const userPermissions = getPermissions(userRol);


    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Home sx={{ mr: 2, fontSize: 48, color: 'primary.main' }} />

                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: '700', color: '#1a237e' }}
                    >
                        Panel de Control
                    </Typography>
                </Box>


                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    Bienvenido al **Sistema de Gestión de Contenidos (CMS)**. Utiliza los siguientes enlaces para empezar a gestionar contenido.
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>


                    {/* Botón para Gestionar Noticias */}
                    <Button
                        component={RouterLink}
                        to="/admin/noticias"
                        variant="contained"
                        size="large"
                        startIcon={<Newspaper />}
                        sx={{
                            p: 2,
                            minWidth: 280,
                            fontSize: '1.05rem',
                        }}
                    >
                        Gestionar Noticias
                    </Button>


                    {/* Botón para Gestionar Secciones */}
                    <Button
                        component={RouterLink}
                        to="/admin/secciones"
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<Category />}
                        sx={{
                            p: 2,
                            minWidth: 280,
                            fontSize: '1.05rem',
                            borderColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white',
                            },
                        }}
                        disabled={userRol === 'Reportero'}
                    >
                        Gestionar Secciones
                    </Button>

                </Box>


                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e0e0e0' }}>

                    <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 500 }}>
                        <span style={{ color: '#00796b' }}>Tu Rol:</span> **{userRol}**
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <span style={{ color: '#00796b' }}>Permisos:</span> {userPermissions}
                    </Typography>

                </Box>


            </Paper>

        </Container>

    );
};

export default Dashboard;