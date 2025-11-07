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

const Dashboard = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Home sx={{ mr: 1, fontSize: 40, color: 'primary.main' }} />
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 'bold' }}
                    >
                        Panel Administrativo Principal
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    Bienvenido al Sistema de Gestión de Contenidos (CMS). Usa los enlaces rápidos a continuación para comenzar a trabajar.
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>

                    {/* Botón para Gestionar Noticias (RF-06) */}
                    <Button
                        component={RouterLink}
                        to="/admin/noticias"
                        variant="contained"
                        size="large"
                        startIcon={<Newspaper />}
                        sx={{ p: 2, minWidth: 250 }}
                    >
                        Gestionar Noticias (RF-06)
                    </Button>

                    {/* Botón para Gestionar Secciones (RF-08) */}
                    <Button
                        component={RouterLink}
                        to="/admin/secciones"
                        variant="outlined"
                        size="large"
                        color="success"
                        startIcon={<Category />}
                        sx={{ p: 2, minWidth: 250 }}
                    >
                        Gestionar Secciones (RF-08)
                    </Button>
                </Box>

                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #eee' }}>
                    <Typography variant="subtitle1" color="text.secondary">
                        Tu rol actual te permite: Crear, Editar, Publicar/Eliminar noticias (Reportero).
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Dashboard;