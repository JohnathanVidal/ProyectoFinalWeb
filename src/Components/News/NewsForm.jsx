import React, { useState, useEffect } from 'react';
import { crearNoticia, actualizarNoticia } from '../../../src/services/NoticiaService';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Grid,
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert, // Añadido para manejar mensajes de error en el formulario
    Tooltip // Agregado para mejor UX
} from '@mui/material';
import { Save, Cancel, CloudUpload } from '@mui/icons-material';


const NewsForm = ({ secciones, autorId, onSuccess, noticiaAEditar, setNoticiaAEditar }) => {

    const initialState = {
        titulo: '',
        subtitulo: '',
        contenido: '',
        categoria: '', // Se asume que esto corresponde al nombre de la sección
    };

    const [form, setForm] = useState(initialState);
    const [imagenFile, setImagenFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Nuevo estado para manejar errores
    const isEditing = !!noticiaAEditar;


    // Llenar el formulario si estamos en modo edición
    useEffect(() => {
        setError(null);
        if (noticiaAEditar) {
            setForm({
                titulo: noticiaAEditar.titulo,
                subtitulo: noticiaAEditar.subtitulo,
                contenido: noticiaAEditar.contenido,
                categoria: noticiaAEditar.categoria,
            });
            // Al editar, no hay un archivo cargado inicialmente.
            setImagenFile(null);
        } else {
            setForm(initialState);
            setImagenFile(null);
        }
    }, [noticiaAEditar]);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleFileChange = (e) => {
        setImagenFile(e.target.files[0]);
    };


    const handleCancelEdit = () => {
        setNoticiaAEditar(null);
        setForm(initialState);
        setImagenFile(null);
        setError(null);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                // Preparamos los datos base para la actualización
                const updatedFields = { ...form };

                // El servicio de actualizarNoticia necesita saber la imagen previa 
                // para eliminarla si subimos una nueva, o conservarla si no hay cambio.
                const currentPublicId = noticiaAEditar.imagenPublicId || null;

                // Actualizar
                await actualizarNoticia(
                    noticiaAEditar.id,
                    updatedFields,
                    imagenFile, // El nuevo archivo (puede ser null)
                    currentPublicId // El ID del archivo a reemplazar (si existe)
                );

                setNoticiaAEditar(null);
            } else {
                // Crear
                if (!imagenFile) {
                    throw new Error("Debe seleccionar una imagen para crear la noticia.");
                }
                await crearNoticia(form, imagenFile, autorId);
            }

            // Limpieza y éxito
            setForm(initialState);
            setImagenFile(null);
            onSuccess(); // Recargar la lista de noticias

        } catch (err) {
            console.error("Error al guardar la noticia:", err);
            // Mostrar error al usuario
            setError(err.message || 'Ocurrió un error al guardar la noticia.');
        } finally {
            setLoading(false);
        }
    };


    return (
        // Usamos Box y Paper para dar un contenedor con elevación
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderLeft: `5px solid ${isEditing ? '#00796b' : '#1a237e'}` }}>

            <Typography variant="h5" component="h3" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                {/* Título corregido: 'Editar Noticia' con ícono, 'Crear Nueva Noticia' sin ícono adicional */}
                {isEditing ? '🖊️ Editar Noticia' : 'Crear Nueva Noticia'}
            </Typography>


            {/* Mensaje de Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    **Error**: {error}
                </Alert>
            )}


            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={3}> {/* Aumentamos el spacing a 3 */}

                    {/* Título */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Título Principal de la Noticia"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    {/* Subtítulo o Bajante */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Subtítulo o Bajante (Resumen)"
                            name="subtitulo"
                            value={form.subtitulo}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    {/* Contenido (SIN RF) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Contenido de la Noticia"
                            name="contenido"
                            value={form.contenido}
                            onChange={handleChange}
                            required
                            multiline
                            rows={8}
                        />
                    </Grid>


                    {/* Selector de Categoría (Sección) */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="categoria-label">Seleccione una Sección</InputLabel>
                            <Select
                                labelId="categoria-label"
                                label="Seleccione una Sección"
                                name="categoria"
                                value={form.categoria}
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Sin Categoría</em>
                                </MenuItem>
                                {/* Asume que 'secciones' es un array de objetos { id: string, nombre: string } */}
                                {secciones?.map(sec => (
                                    <MenuItem key={sec.id} value={sec.nombre}>
                                        {sec.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>


                    {/* Subida de Imagen */}
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={isEditing && noticiaAEditar?.imagenUrl ? "Suba un archivo para reemplazar la imagen actual" : "Seleccionar imagen principal"} arrow>
                            <Button
                                variant="contained" // Usamos contained para destacar la acción
                                component="label"
                                startIcon={<CloudUpload />}
                                sx={{ mr: 2 }}
                            >
                                {isEditing ? 'Cambiar Imagen' : 'Subir Imagen'}
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    // Requerido solo al CREAR si no hay imagen previa
                                    required={!isEditing && !noticiaAEditar?.imagenUrl}
                                />
                            </Button>
                        </Tooltip>
                        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
                            {imagenFile
                                ? imagenFile.name
                                : isEditing && noticiaAEditar?.imagenUrl
                                    ? `Imagen actual cargada` // Texto simplificado
                                    : 'Ningún archivo seleccionado'}
                        </Typography>
                    </Grid>

                </Grid>


                {/* Botones de Acción */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {loading ? (
                        <Button variant="contained" disabled startIcon={<CircularProgress size={20} color="inherit" />}>
                            Guardando...
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                            >
                                {isEditing ? 'Guardar Cambios' : 'Crear Noticia'}
                            </Button>

                            {isEditing && (
                                <Button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Cancel />}
                                >
                                    Cancelar Edición
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default NewsForm;