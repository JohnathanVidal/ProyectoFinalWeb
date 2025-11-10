import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Typography,
    Tooltip,
    Chip // Usamos Chip para el estado, es más limpio que el <span>
} from '@mui/material';
import { Edit, Delete, CheckCircle, Publish, Block, FiberManualRecord } from '@mui/icons-material';

// Función para obtener el Chip de estado
const getEstadoChip = (estado) => {
    let color = 'default';
    let label = estado;
    let icon = <FiberManualRecord fontSize="small" />;

    switch (estado) {
        case 'Publicado':
            color = 'success';
            label = 'Publicado';
            icon = <Publish fontSize="small" />;
            break;
        case 'Terminado':
            color = 'warning';
            label = 'Revisión';
            icon = <CheckCircle fontSize="small" />;
            break;
        case 'Desactivado':
            color = 'error';
            label = 'Desactivado';
            icon = <Block fontSize="small" />;
            break;
        case 'Edición':
        default:
            color = 'info';
            label = 'Edición';
            icon = <Edit fontSize="small" />;
            break;
    }

    return <Chip label={label} color={color} size="small" icon={icon} sx={{ minWidth: 100 }} />;
};


const NewsTable = ({ noticias, isEditor, onEdit, onDelete, onPublish, onFinish, showQueue = false }) => {

    // Se asume que onPublish/onFinish están definidos en ManageNews y actualizan el estado de la noticia

    if (noticias.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 3, textAlign: 'center' }}>
                No hay noticias para gestionar en este momento.
            </Alert>
        );
    }


    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de gestión de noticias">
                <TableHead sx={{ backgroundColor: showQueue ? '#d32f2f' : '#1a237e' }}> {/* Color distinto para la cola de revisión */}
                    <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Título</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sección</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Autor</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 250 }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {noticias.map(noticia => (
                        <TableRow
                            key={noticia.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {noticia.titulo}
                            </TableCell>
                            {/* Se asume que el campo en Firestore es 'categoria' o 'seccion' */}
                            <TableCell>{noticia.categoria || noticia.seccion}</TableCell>
                            <TableCell>{noticia.autor}</TableCell>
                            <TableCell>
                                {getEstadoChip(noticia.estado)}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>

                                    {/* ACCIONES COMUNES (Editar/Eliminar/Marcar Terminado) */}
                                    {/* Mostrar Editar/Eliminar si no está Publicado */}
                                    {noticia.estado !== 'Publicado' && (
                                        <Tooltip title="Editar Contenido">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Edit />}
                                                onClick={() => onEdit(noticia)}
                                            >
                                                Editar
                                            </Button>
                                        </Tooltip>
                                    )}

                                    <Tooltip title="Eliminar Noticia">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Delete />}
                                            onClick={() => onDelete(noticia.id, noticia.imagenPublicId)}
                                        >
                                            Eliminar
                                        </Button>
                                    </Tooltip>

                                    {/* MARCAR TERMINADO (Solo Reportero en Edición y si no está Publicado) */}
                                    {!isEditor && noticia.estado === 'Edición' && (
                                        <Tooltip title="Marcar como 'Terminado' para que un Editor la revise.">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                startIcon={<CheckCircle />}
                                                onClick={() => onFinish(noticia.id)} // Llama a la función que cambia el estado a 'Terminado'
                                            >
                                                Marcar Terminado
                                            </Button>
                                        </Tooltip>
                                    )}


                                    {/* ACCIONES DEL EDITOR (Publicar/Desactivar) */}
                                    {isEditor && (
                                        <>
                                            {/* Publicar (Disponible si es Terminado o Desactivado) */}
                                            {(noticia.estado === 'Terminado' || noticia.estado === 'Desactivado') && (
                                                <Tooltip title="Publicar la noticia en el sitio web">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<Publish />}
                                                        onClick={() => onPublish(noticia.id, 'Publicado')}
                                                    >
                                                        Publicar
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* Desactivar (Disponible si es Publicado) */}
                                            {noticia.estado === 'Publicado' && (
                                                <Tooltip title="Desactivar la noticia (Poner en estado 'Desactivado')">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="warning"
                                                        startIcon={<Block />}
                                                        onClick={() => onPublish(noticia.id, 'Desactivado')} // Reutilizamos onPublish
                                                    >
                                                        Desactivar
                                                    </Button>
                                                </Tooltip>
                                            )}
                                        </>
                                    )}

                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default NewsTable;