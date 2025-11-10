import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../Context/ContextoAutenticacion';

import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    Button,
    Paper,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Article,
    Settings,
    ExitToApp,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';

// Componente de Tarjeta de Acceso Rápido
const QuickAccessCard = ({ title, icon, link, color, roleRequired }) => {
    const { userData } = useAuth();
    const userRole = userData?.rol;

    // La tarjeta está permitida si no hay requisitos de rol o si el rol coincide con 'Editor'
    const isAllowed = !roleRequired || userRole === 'Editor';

    return (
        <Grid item xs={12} sm={6} md={6}> {/* Usamos md=6 para distribuir las 2 tarjetas */}
            <Tooltip title={isAllowed ? `Acceder al módulo de ${title}` : "Solo Editores pueden acceder a esta función."}>
                <span>
                    <Card
                        elevation={4}
                        sx={{
                            height: '100%',
                            textAlign: 'center',
                            p: 2,
                            backgroundColor: color,
                            color: 'white',
                            transition: 'transform 0.3s',
                            opacity: isAllowed ? 1 : 0.6,
                            '&:hover': {
                                transform: isAllowed ? 'translateY(-5px)' : 'none',
                                boxShadow: isAllowed ? '0 10px 20px rgba(0,0,0,0.2)' : 'none',
                            }
                        }}
                    >
                        <CardContent>
                            {React.cloneElement(icon, { sx: { fontSize: 50, mb: 1 } })}
                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>
                            <Button
                                component={RouterLink}
                                to={link}
                                variant="contained"
                                disabled={!isAllowed}
                                sx={{
                                    mt: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                                }}
                            >
                                {isAllowed ? 'Acceder' : 'Acceso Denegado'}
                            </Button>
                        </CardContent>
                    </Card>
                </span>
            </Tooltip>
        </Grid>
    );
};


const Dashboard = () => {
    const { currentUser, userData, logout } = useAuth();

    // Función de Logout
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f9' }}>

            {/* Header del Admin */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 3, mb: 4, boxShadow: 3 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DashboardIcon sx={{ mr: 1, fontSize: 35 }} />
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            Panel de Administración
                        </Typography>
                    </Box>
                    <Tooltip title="Cerrar sesión">
                        <Button
                            color="inherit"
                            variant="outlined"
                            startIcon={<ExitToApp />}
                            onClick={handleLogout}
                            sx={{ borderColor: 'white' }}
                        >
                            Salir
                        </Button>
                    </Tooltip>
                </Container>
            </Box>

            {/* Contenido Principal */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, mb: 5 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'medium', color: '#1a237e', borderBottom: '2px solid #e0e0e0', pb: 1 }}>
                    Bienvenido, {userData?.rol || 'Usuario'}
                </Typography>

                <Grid container spacing={4}>
                    {/* GESTIÓN DE NOTICIAS (Para Reporteros y Editores) */}
                    <QuickAccessCard
                        title="Gestión de Noticias"
                        icon={<Article />}
                        link="/admin/noticias"
                        color="#00796b"
                    />

                    {/* GESTIÓN DE SECCIONES (Solo para Editores) */}
                    <QuickAccessCard
                        title="Gestión de Secciones"
                        icon={<Settings />}
                        link="/admin/secciones"
                        color="#1a237e"
                        roleRequired="Editor"
                    />

                    {/* Se ELIMINA Estadísticas & Reportes */}
                </Grid>

                <Divider sx={{ my: 5 }} />

                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: '#1a237e' }}>
                    Mi Perfil
                </Typography>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            {/* Formato sin negritas en la etiqueta */}
                            <Typography variant="body1">
                                Correo Electrónico: <strong>{currentUser?.email}</strong>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {/* Formato sin negritas en la etiqueta */}
                            <Typography variant="body1">
                                Rol Asignado: <strong style={{ color: userData?.rol === 'Editor' ? '#d84315' : '#00796b' }}>{userData?.rol || 'Cargando...'}</strong>
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* Footer Admin */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', py: 2, textAlign: 'center', mt: 'auto' }}>
                <Typography variant="body2">
                    Panel de Administración | FuckNews VDL | Versión 1.0
                </Typography>
            </Box>
        </Box>
    );
};

export default Dashboard;