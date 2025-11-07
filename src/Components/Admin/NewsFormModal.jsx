import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { crearNoticia, actualizarNoticia, obtenerNoticiaPorId } from '../../services/NoticiaService';
import { useAuth } from '../../Context/ContextoAutenticacion';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600, md: 800 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

// Placeholder para las secciones (RF-08) - Asumimos datos de prueba por ahora
const SECCIONES_MOCK = [
    { id: 'general', nombre: 'General' },
    { id: 'deportes', nombre: 'Deportes' },
    { id: 'economia', nombre: 'Economía' },
];

/**
 * Modal para la creación y edición de noticias.
 * @param {object} props
 * @param {boolean} props.open - Controla si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSuccess - Función a ejecutar tras una operación exitosa.
 * @param {string|null} props.noticiaId - ID de la noticia a editar (null para crear).
 */
const NewsFormModal = ({ open, onClose, onSuccess, noticiaId }) => {
    const { userData, isAuthReady } = useAuth();
    const [formData, setFormData] = useState({
        titulo: '',
        cuerpo: '',
        seccion: '',
        // Aquí iría el estado si lo estuviéramos editando
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(false);

    // Indica si es una operación de edición o creación
    const isEditing = !!noticiaId;

    // Cargar datos si estamos en modo edición
    useEffect(() => {
        if (open && isEditing && noticiaId && isAuthReady) {
            setInitialLoading(true);
            setError(null);
            obtenerNoticiaPorId(noticiaId)
                .then(data => {
                    if (data) {
                        setFormData({
                            titulo: data.titulo || '',
                            cuerpo: data.cuerpo || '',
                            seccion: data.seccion || '',
                        });
                        setImagePreviewUrl(data.imagenUrl || '');
                    }
                })
                .catch(err => setError('Error al cargar la noticia para edición.'))
                .finally(() => setInitialLoading(false));
        } else if (open && !isEditing) {
            // Resetear el formulario al abrir en modo creación
            setFormData({ titulo: '', cuerpo: '', seccion: '' });
            setImageFile(null);
            setImagePreviewUrl('');
        }
    }, [open, isEditing, noticiaId, isAuthReady]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); // Crear previsualización local
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!userData || !userData.uid) {
            setError("Error: No se pudo obtener el ID del autor. Intente iniciar sesión nuevamente.");
            setLoading(false);
            return;
        }

        try {
            // 1. Manejar la subida de imagen (solo si hay un nuevo archivo para crear o editar)
            let finalImageUrl = imagePreviewUrl; // Mantener la URL existente por defecto
            let finalImageStoragePath = '';

            if (imageFile) {
                // RF-09: Subir la nueva imagen y obtener la URL/Path
                const imagenData = await crearNoticia(imageFile); // Reutiliza la función auxiliar
                finalImageUrl = imagenData.url;
                finalImageStoragePath = imagenData.ref;
            }
            // NOTA: La lógica de edición para eliminar la imagen antigua se maneja en NoticiaService.js/actualizarNoticia (próxima integración)

            const noticiaFinalData = {
                ...formData,
                imagenUrl: finalImageUrl,
                imagenStoragePath: finalImageStoragePath,
            };

            if (isEditing) {
                // Modo Edición (RF-06)
                // Usamos la función actualizarNoticia del servicio.
                await actualizarNoticia(noticiaId, noticiaFinalData, imageFile); // Se enviará el archivo para la lógica de reemplazo
                onSuccess("Noticia actualizada exitosamente.");
            } else {
                // Modo Creación (RF-06)
                // El servicio crearNoticia ya maneja la subida de la imagen
                await crearNoticia(formData, imageFile, userData.uid);
                onSuccess("Noticia creada exitosamente. Estado inicial: Edición.");
            }

            handleClose(); // Cierra el modal
        } catch (err) {
            console.error("Fallo en la operación:", err);
            setError(err.message || "Error al procesar la noticia. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Función para cerrar el modal y limpiar estados
    const handleClose = () => {
        setLoading(false);
        setError(null);
        setFormData({ titulo: '', cuerpo: '', seccion: '' });
        setImageFile(null);
        setImagePreviewUrl('');
        onClose();
    };

    if (initialLoading) {
        return (
            <Modal open={open} onClose={handleClose}>
                <Box sx={style} display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
                </Box>
            </Modal>
        );
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} component="form" onSubmit={handleSubmit}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography id="modal-modal-title" variant="h5" component="h2" gutterBottom>
                    {isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia (RF-06)'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Título"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    disabled={loading}
                    sx={{ mb: 2 }}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Cuerpo de la Noticia"
                    name="cuerpo"
                    multiline
                    rows={6}
                    value={formData.cuerpo}
                    onChange={handleChange}
                    disabled={loading}
                    sx={{ mb: 2 }}
                />

                <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
                    <InputLabel id="seccion-label">Sección (RF-08)</InputLabel>
                    <Select
                        labelId="seccion-label"
                        id="seccion"
                        name="seccion"
                        value={formData.seccion}
                        label="Sección"
                        onChange={handleChange}
                        disabled={loading}
                    >
                        {SECCIONES_MOCK.map((seccion) => (
                            <MenuItem key={seccion.id} value={seccion.id}>
                                {seccion.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Campo de Subida de Imagen (RF-09) */}
                <Box sx={{ border: '1px dashed #ccc', p: 2, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <InputLabel htmlFor="image-upload-button" sx={{ mb: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ImageOutlinedIcon sx={{ mr: 1 }} />
                        {isEditing ? 'Cambiar Imagen' : 'Subir Imagen Principal (RF-09)'}
                    </InputLabel>
                    <input
                        accept="image/*"
                        id="image-upload-button"
                        type="file"
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ display: 'none' }}
                    />

                    {imagePreviewUrl && (
                        <Box sx={{ mt: 2, maxWidth: '100%' }}>
                            <Typography variant="caption" display="block" gutterBottom>
                                Previsualización:
                            </Typography>
                            <img
                                src={imagePreviewUrl}
                                alt="Previsualización"
                                style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }}
                            />
                        </Box>
                    )}
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading || !formData.titulo || !formData.cuerpo || !formData.seccion}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Noticia')}
                </Button>
            </Box>
        </Modal>
    );
};

export default NewsFormModal;