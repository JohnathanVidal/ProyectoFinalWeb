import React from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../Context/ContextoAutenticacion';
import { Box, CircularProgress, Typography, Button } from '@mui/material';


const RutaProtegida = ({ children, allowedRoles = [] }) => {

    // Extraemos los valores del contexto
    const { currentUser, userData, isAuthReady } = useAuth();

    // 1. Mostrar Loader mientras se carga el estado de autenticación
    if (!isAuthReady) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh" flexDirection="column">
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Cargando datos de usuario...</Typography>
            </Box>
        );
    }


    // 2. Si no hay usuario logueado, redirigir a Login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }


    // 3. Verificar roles (Solo se verifica si se pasaron roles permitidos)
    if (allowedRoles.length > 0) {

        // La propiedad 'role' viene del mapeo en ContextoAutenticacion
        const userRole = userData?.role;


        if (!userRole || !allowedRoles.includes(userRole)) {
            console.error(`Acceso denegado. Rol del usuario (${userRole}) no permitido.`);


            // Mostrar página de acceso denegado
            return (
                <Box mt={5} textAlign="center">
                    <Typography variant="h5" color="error">
                        ACCESO DENEGADO
                    </Typography>
                    <Typography variant="body1">
                        Su rol ({userRole || 'sin definir'}) no tiene permiso para ver esta página.
                    </Typography>
                    <Box mt={3}>
                        <Button component={RouterLink} to="/" variant="contained">
                            Ir a la página principal
                        </Button>
                    </Box>
                </Box>
            );
        }

    }


    // 4. Si todas las verificaciones pasan, renderizar los componentes hijos
    return children;
};

export default RutaProtegida;