import React from 'react';
import { useAuth } from '../../Context/ContextoAutenticacion';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const RutaProtegida = () => {
    // Obtiene el estado de autenticación del contexto
    const { isAuthenticated, isAuthReady } = useAuth();

    // Muestra un loader mientras Firebase inicializa y verifica el estado de autenticación
    if (!isAuthReady) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <CircularProgress color="primary" size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="textSecondary">Cargando autenticación...</Typography>
            </Box>
        );
    }

    // Si el usuario no está autenticado, redirige al login (RF-02)
    if (!isAuthenticated) {
        // Redirige usando el componente Navigate de react-router-dom
        return <Navigate to="/login" replace />;
    }

    // Si el usuario está autenticado, renderiza la ruta hija (Dashboard o ManageNews)
    return <Outlet />;
};

export default RutaProtegida;