import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    Tooltip
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon
} from '@mui/icons-material';

/**
 * Componente que muestra la cola de noticias listas para ser publicadas por el Editor (RF-07).
 */
const PublicationQueue = ({ noticiasPendientes, onPublish }) => {

    if (!noticiasPendientes || noticiasPendientes.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 4 }}>
                Actualmente no hay noticias en estado **"Terminado"** pendientes de publicación.
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 5 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="warning" sx={{ mr: 1 }} />
                Cola de Publicación (RF-07)
            </Typography>
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                <TableCell>Título</TableCell>
                                <TableCell>Autor (ID)</TableCell>
                                <TableCell>Fecha de Finalización</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {noticiasPendientes.map((noticia) => (
                                <TableRow key={noticia.id} hover>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{noticia.titulo}</TableCell>
                                    <TableCell>{noticia.autor}</TableCell>
                                    <TableCell>
                                        {new Date(noticia.fechaActualizacion).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Publicar Noticia (Visible en el Home)">
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => onPublish(noticia.id, 'Publicado')}
                                                sx={{ mr: 1 }}
                                            >
                                                Publicar
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Desactivar Noticia (Ocultar de la vista pública)">
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<BlockIcon />}
                                                onClick={() => onPublish(noticia.id, 'Desactivado')}
                                            >
                                                Desactivar
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default PublicationQueue;