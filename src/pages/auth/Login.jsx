import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../Context/ContextoAutenticacion'; // Usamos las instancias exportadas

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Rol por defecto para los nuevos registros (cumple con RF-03 inicial)
    const DEFAULT_ROLE = 'Reportero';

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Verificar que Auth y DB estén disponibles antes de proceder
        if (!auth || !db) {
            setError("Error de configuración: Firebase Auth o Firestore no están inicializados.");
            setLoading(false);
            return;
        }

        try {
            let userCredential;

            if (isRegistering) {
                // Registro de nuevo usuario (RF-01)
                userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Asignar el rol en Firestore (RF-03)
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: userCredential.user.email,
                    rol: DEFAULT_ROLE,
                    createdAt: new Date()
                });

            } else {
                // Inicio de sesión (RF-01)
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            // Éxito: Redirigir al Dashboard (RF-04)
            navigate('/admin');

        } catch (err) {
            console.error(err);
            if (err.code) {
                // Manejo de errores comunes de Firebase Auth
                if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                    setError('Credenciales incorrectas. Verifica tu email y contraseña.');
                } else if (err.code === 'auth/email-already-in-use') {
                    setError('El correo ya está registrado. Intenta iniciar sesión.');
                } else if (err.code === 'auth/weak-password') {
                    setError('La contraseña debe tener al menos 6 caracteres.');
                } else {
                    setError(`Error de autenticación: ${err.message}`);
                }
            } else {
                setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ p: 1.5, mb: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'white' }}>
                    {isRegistering ? <PersonAddIcon /> : <LockOutlinedIcon />}
                </Box>

                <Typography component="h1" variant="h5" gutterBottom>
                    {isRegistering ? 'Registrar Reportero (RF-03)' : 'Acceso al CMS (RF-01)'}
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleAuth} sx={{ mt: 1, width: '100%' }}>
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
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                        color={isRegistering ? 'secondary' : 'primary'}
                        startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    >
                        {loading ? 'Procesando...' : (isRegistering ? 'Registrarme' : 'Iniciar Sesión')}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => setIsRegistering(!isRegistering)}
                        disabled={loading}
                    >
                        {isRegistering ? 'Ya tengo cuenta, Iniciar Sesión' : '¿No tienes cuenta? Regístrate aquí'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;