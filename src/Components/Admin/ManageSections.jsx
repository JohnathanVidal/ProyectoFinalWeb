import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import {
    obtenerSecciones,
    crearSeccion,
    actualizarSeccion,
    eliminarSeccion
} from '../../services/SeccionService';
import { useAuth } from '../../Context/ContextoAutenticacion';

// Mapeo de estados para estilos visuales
const ESTADO_COLORES =
{
    'Activa': { label: 'Activa', color: 'success' },
    'Inactiva': { label: 'Inactiva', color: 'error' },
};

const ManageSections = () => {
    const { userData } = useAuth();
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Estado del formulario
    const [nombre, setNombre] = useState('');
    const [estado, setEstado] = useState('Activa');
    const [isEditing, setIsEditing] = useState(false);
    const [currentSeccionId, setCurrentSeccionId] = useState(null);


    const loadSecciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await obtenerSecciones();
            setSecciones(data);
        } catch (err) {
            console.error("Error al cargar secciones:", err);
            setError("Fallo al cargar las secciones.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userData && userData.rol === 'Editor') {
            loadSecciones();
        }
    }, [userData, loadSecciones]);

    const resetForm = () => {
        setNombre('');
        setEstado('Activa');
        setIsEditing(false);
        setCurrentSeccionId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isEditing) {
                await actualizarSeccion(currentSeccionId, { nombre, estado });
                setSuccessMessage("Sección actualizada con éxito.");
            } else {
                await crearSeccion(nombre, estado);
                setSuccessMessage("Sección creada con éxito.");
            }
            resetForm();
            await loadSecciones();
        } catch (err) {
            setError(err.message || "Fallo al guardar la sección.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (seccion) => {
        setNombre(seccion.nombre);
        setEstado(seccion.estado);
        setCurrentSeccionId(seccion.id);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Está seguro de que desea eliminar esta sección?")) {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                await eliminarSeccion(id);
                setSuccessMessage("Sección eliminada con éxito.");
                await loadSecciones();
            } catch (err) {
                setError(err.message || "Fallo al eliminar la sección.");
            } finally {
                setLoading(false);
            }
        }
    };

    // --- Restricción de Acceso ---
    if (!userData || userData.rol !== 'Editor') {
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="error" variant="filled">
                    Acceso Denegado. Solo los Editores pueden gestionar secciones.
                </Alert>
            </Container>
        );
    }

    if (loading && secciones.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ mt: 5, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Cargando secciones...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <CategoryIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Secciones
                </Typography>
            </Box>


            {/* Mensajes de feedback */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}


            {/* Formulario de Creación/Edición */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    {isEditing ? 'Editar Sección' : 'Crear Nueva Sección'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <TextField
                        required
                        label="Nombre de la Sección"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        disabled={loading}
                        sx={{ minWidth: 200 }}
                    />

                    <FormControl sx={{ minWidth: 150 }} required>
                        <InputLabel id="estado-label">Estado</InputLabel>
                        <Select
                            labelId="estado-label"
                            value={estado}
                            label="Estado"
                            onChange={(e) => setEstado(e.target.value)}
                            disabled={loading}
                        >
                            <MenuItem value={'Activa'}>Activa</MenuItem>
                            <MenuItem value={'Inactiva'}>Inactiva</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={isEditing ? <EditIcon /> : <AddIcon />}
                        disabled={loading || !nombre.trim() || !estado}
                        sx={{ height: '56px' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Guardar Cambios' : 'Crear')}
                    </Button>

                    {isEditing && (
                        <Button
                            variant="outlined"
                            onClick={resetForm}
                            disabled={loading}
                            sx={{ height: '56px' }}
                        >
                            Cancelar
                        </Button>
                    )}

                </Box>

            </Paper>


            {/* Tabla de Secciones */}
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#e8eaf6' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Creación</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {secciones.map((seccion) => (
                                <TableRow key={seccion.id} hover>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{seccion.nombre}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ESTADO_COLORES[seccion.estado].label}
                                            color={ESTADO_COLORES[seccion.estado].color}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(seccion.createdAt.toDate ? seccion.createdAt.toDate() : seccion.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar">
                                            <IconButton color="primary" onClick={() => handleEditClick(seccion)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton color="error" onClick={() => handleDelete(seccion.id)} size="small" sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

        </Container>

    );
};

export default ManageSections;