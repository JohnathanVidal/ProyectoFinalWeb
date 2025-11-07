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
    InputLabel
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

// Mapeo de estados para estilos visuales
const ESTADO_COLORES = {
    'Activa': 'success',
    'Inactiva': 'error',
};

const ManageSections = () => {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Estado para el formulario de crear/editar
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [estado, setEstado] = useState('Activa');

    // Función principal para cargar las secciones
    const loadSecciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await obtenerSecciones();
            setSecciones(list);
        } catch (err) {
            setError("Error al cargar las secciones. Revise la consola.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar secciones al montar el componente
    useEffect(() => {
        loadSecciones();
    }, [loadSecciones]);

    // Función para resetear el formulario
    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setNombre('');
        setEstado('Activa');
    };

    // Manejador de Creación/Actualización (RF-08)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                await actualizarSeccion(currentId, { nombre, estado });
                setSuccessMessage("Sección actualizada exitosamente.");
            } else {
                await crearSeccion(nombre, estado);
                setSuccessMessage("Sección creada exitosamente.");
            }

            resetForm(); // Limpiar formulario
            loadSecciones(); // Recargar lista

        } catch (err) {
            setError(err.message || "Error al procesar la sección. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Manejador de Edición
    const handleEditClick = (seccion) => {
        setIsEditing(true);
        setCurrentId(seccion.id);
        setNombre(seccion.nombre);
        setEstado(seccion.estado);
    };

    // Manejador de Eliminación
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta sección? Esto podría afectar noticias asociadas.")) {
            setLoading(true);
            try {
                await eliminarSeccion(id);
                setSuccessMessage("Sección eliminada correctamente.");
                loadSecciones();
            } catch (err) {
                setError("Error al eliminar la sección. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading && secciones.length === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 5, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Cargando secciones...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <CategoryIcon sx={{ mr: 1, fontSize: 35, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Secciones (RF-08)
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

                    <FormControl sx={{ minWidth: 150 }}>
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
                        disabled={loading || !nombre}
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
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Fecha de Creación</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {secciones.map((seccion) => (
                                <TableRow key={seccion.id} hover>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{seccion.nombre}</TableCell>
                                    <TableCell>
                                        <Alert
                                            severity={ESTADO_COLORES[seccion.estado] || 'default'}
                                            sx={{ py: 0, px: 1, textTransform: 'capitalize' }}
                                        >
                                            {seccion.estado}
                                        </Alert>
                                    </TableCell>
                                    <TableCell>{new Date(seccion.createdAt.toDate ? seccion.createdAt.toDate() : seccion.createdAt).toLocaleDateString()}</TableCell>
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