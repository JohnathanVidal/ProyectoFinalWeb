import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    CircularProgress,
    Chip, // Usaremos Chip para mostrar el rol de forma limpia
    Tooltip, // Añadido para mejor UX
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../Context/ContextoAutenticacion';

import LogoutIcon from '@mui/icons-material/Logout';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';

const Header = () => {
    // Obtenemos el estado de autenticación y la función de cierre de sesión
    const { currentUser, userData, isAuthReady, logout } = useAuth();

    // Función para manejar el cierre de sesión
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // Mensaje más amigable
            alert("Fallo al cerrar sesión. Por favor, inténtelo de nuevo.");
        }
    };

    const userEmail = userData?.email || 'Usuario';
    const userRole = userData?.rol || 'No Definido';

    return (
        <AppBar
            position="sticky" // Permite que se quede fijo al hacer scroll
            sx={{
                bgcolor: '#1a237e', // Azul oscuro (Deep Purple 900)
                boxShadow: 6, // Sombra más pronunciada
                borderBottom: '4px solid #00796b', // Línea de contraste verde oscuro
            }}
        >
            <Toolbar>

                {/* Logo y Título */}
                <NewspaperIcon sx={{ mr: 1, fontSize: 30, color: '#ffeb3b' }} /> {/* Icono llamativo en amarillo */}
                <Typography
                    variant="h5"
                    component={RouterLink}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        letterSpacing: 1.2
                    }}
                >
                    FuckNews VDL
                </Typography>

                {/* Loader para cuando el estado de autenticación se está inicializando */}
                {!isAuthReady && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress color="inherit" size={24} sx={{ mr: 1 }} />
                    </Box>
                )}

                {/* Contenido si el usuario está logueado */}
                {currentUser && isAuthReady ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                        {/* Botón para ir al Dashboard (visible si está autenticado) */}
                        <Tooltip title="Ir al Panel de Control">
                            <Button
                                component={RouterLink}
                                to="/admin"
                                color="inherit"
                                startIcon={<DashboardIcon />}
                                variant="outlined"
                                sx={{ borderColor: '#ffffff50' }}
                            >
                                Dashboard
                            </Button>
                        </Tooltip>

                        {/* Información del Usuario (Email y Rol) */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: '#00796b', // Fondo verde oscuro para destacar la info
                                borderRadius: 1,
                                p: 1,
                                minWidth: 200 // Mínimo para que se vea bien
                            }}
                        >
                            <PersonIcon sx={{ mr: 1, fontSize: 18, color: 'white' }} />
                            <Box>
                                <Typography variant="caption" display="block" sx={{ lineHeight: 1.2, fontWeight: 'medium' }}>
                                    {userEmail.substring(0, 20) + (userEmail.length > 20 ? '...' : '')}
                                </Typography>
                                <Chip
                                    label={userRole}
                                    size="small"
                                    color="secondary" // Usa el color secundario (o un color personalizado)
                                    sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }}
                                />
                            </Box>
                        </Box>

                        {/* Botón de Cierre de Sesión */}
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            variant="contained" // Lo hacemos "contained" para que destaque
                            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }} // Rojo para acción de salida
                        >
                            Salir
                        </Button>
                    </Box>
                ) : (
                    // Si no está logueado y el sistema está listo (isAuthReady), mostramos Login
                    isAuthReady && (
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/login"
                            variant="outlined"
                            startIcon={<LoginIcon />}
                            sx={{ borderColor: 'white' }}
                        >
                            Acceso Admin
                        </Button>
                    )
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;