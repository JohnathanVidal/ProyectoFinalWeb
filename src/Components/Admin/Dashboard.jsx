import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const Dashboard = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 5, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ borderBottom: '2px solid', pb: 1, mb: 3 }}>
                Panel Administrativo Principal
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Bienvenido al CMS. Usa los enlaces de abajo para gestionar contenidos según tu rol ({/* Mostrar rol aquí */}).
            </Typography>

            {/* Menú de Navegación Rápida */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>

                {/* Enlace a Noticias */}
                <Button
                    component={RouterLink}
                    to="/admin/noticias"
                    variant="contained"
                    size="large"
                >
                    Gestionar Noticias (RF-06)
                </Button>

                {/* Enlace a Secciones */}
                <Button
                    component={RouterLink}
                    to="/admin/secciones"
                    variant="outlined"
                    size="large"
                    color="success"
                >
                    Gestionar Secciones (RF-08)
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard;