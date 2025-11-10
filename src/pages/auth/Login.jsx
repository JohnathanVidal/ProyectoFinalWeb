import React, { useState } from 'react';
import { useAuth } from '../../Context/ContextoAutenticacion';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper, // Cambiamos Card por Paper para mejor elevación y diseño
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Link,
    Avatar,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Login as LoginIcon, PersonAdd, Newspaper, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage = () => {
    // 1. Contexto de Autenticación
    const { currentUser, isAuthReady, login, signup, userData } = useAuth();

    // Estado para controlar si estamos en modo 'login' o 'register'
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Para mostrar/ocultar contraseña

    // 2. Estados locales
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('Reportero'); // Nuevo: Estado para el rol
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 3. Manejo del Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegisterMode) {
                // Modo Registro: Llamamos a signup y le pasamos el rol
                await signup(email, password, rol);
            } else {
                // Modo Login: Llamamos a login
                await login(email, password);
            }
            // Si es exitoso, el contexto redirigirá, no desactivamos loading aquí.
        } catch (err) {
            setLoading(false);

            let errorMessage = "Fallo al iniciar sesión. Inténtelo de nuevo.";
            if (isRegisterMode) {
                errorMessage = "Fallo al registrar. Verifique los datos o si el usuario ya existe.";
            }

            // Lógica para mostrar errores de Firebase
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                errorMessage = "Credenciales incorrectas. Verifique el correo y la contraseña.";
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = "El correo electrónico ya está registrado.";
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "La contraseña debe tener al menos 6 caracteres.";
            }

            setError(errorMessage);
            console.error(isRegisterMode ? "Error al registrar:" : "Error al iniciar sesión:", err);
        }
    };


    // --- Lógica de Renderizado Condicional ---
    // A. Mostrar loader de Contexto al inicio
    if (!isAuthReady) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f4f7f9' // Fondo suave
                }}
            >
                <CircularProgress color="primary" size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="textSecondary">Cargando estado de autenticación...</Typography>
            </Box>
        );
    }

    // B. Redirección si ya está autenticado (RF-02)
    if (currentUser && isAuthReady && userData?.rol) {
        return <Navigate to="/admin" replace />;
    }

    // C. Mostrar el Formulario (Login o Registro)
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f7f9' // Fondo suave
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={6} // Usamos Paper con mayor elevación para destacar
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#1a237e' }}> {/* Color Azul Principal */}
                        {isRegisterMode ? <PersonAdd /> : <LockOutlined />}
                    </Avatar>
                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
                        {isRegisterMode ? 'Crear Nueva Cuenta' : 'Acceso al Panel Admin'}
                    </Typography>

                    {/* Muestra errores */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            // Icono de correo opcional
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Newspaper color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete={isRegisterMode ? "new-password" : "current-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Nuevo: Selección de Rol (Solo en modo Registro) */}
                        {isRegisterMode && (
                            <FormControl fullWidth margin="normal" disabled={loading}>
                                <InputLabel id="rol-label">Seleccionar Rol</InputLabel>
                                <Select
                                    labelId="rol-label"
                                    id="rol"
                                    value={rol}
                                    label="Seleccionar Rol"
                                    onChange={(e) => setRol(e.target.value)}
                                >
                                    {/* 'Admin' no se incluye para evitar registros accidentales */}
                                    <MenuItem value={'Reportero'}>Reportero</MenuItem>
                                    <MenuItem value={'Editor'}>Editor</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            // Color Verde Teal para el botón principal
                            sx={{ mt: 3, mb: 2, bgcolor: '#00796b', '&:hover': { bgcolor: '#004d40' } }}
                            disabled={loading}
                            startIcon={loading
                                ? <CircularProgress size={20} color="inherit" />
                                : (isRegisterMode ? <PersonAdd /> : <LoginIcon />)
                            }
                        >
                            {loading ? (isRegisterMode ? 'Registrando...' : 'Iniciando...') : (isRegisterMode ? 'Registrar Cuenta' : 'Iniciar Sesión')}
                        </Button>

                        {/* Alternar entre Login y Registro */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => setIsRegisterMode(!isRegisterMode)}
                                disabled={loading}
                                sx={{ cursor: 'pointer', textDecoration: 'none', color: 'primary.main', mb: 1 }}
                            >
                                {isRegisterMode
                                    ? "¿Ya tienes una cuenta? Inicia Sesión"
                                    : "¿No tienes una cuenta? Regístrate aquí"
                                }
                            </Link>
                            <Typography
                                variant="body2"
                                component={RouterLink}
                                to="/"
                                sx={{ textDecoration: 'none', color: 'text.secondary', display: 'block' }}
                            >
                                Volver a la página principal
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    © {new Date().getFullYear()} FuckNews VDL
                </Typography>
            </Container>
        </Box>
    );
};

export default LoginPage;