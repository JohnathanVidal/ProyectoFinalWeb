import React from 'react';

const NewsTable = ({ noticias, isEditor, onEdit, onDelete, onPublish, onFinish }) => {

    const getBackgroundColor = (estado) => {
        switch (estado) {
            case 'Publicado': return '#d4edda'; // Verde claro
            case 'Terminado': return '#fff3cd'; // Amarillo claro
            case 'Desactivado': return '#f8d7da'; // Rojo claro
            case 'Edición':
            default: return '#e2e3e5'; // Gris claro
        }
    };

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Sección</th>
                    <th>Autor</th>
                    <th>Estado (RF-07)</th>
                    <th>Acciones (RF-05)</th>
                </tr>
            </thead>
            <tbody>
                {noticias.map(noticia => (
                    <tr key={noticia.id} style={{ backgroundColor: getBackgroundColor(noticia.estado) }}>
                        <td>{noticia.titulo}</td>
                        <td>{noticia.categoria}</td>
                        <td>{noticia.autor}</td> {/* Idealmente se mostraría el email o nombre del autor */}
                        <td>**{noticia.estado}**</td>
                        <td>
                            {/* ACCIONES COMUNES */}
                            <button onClick={() => onEdit(noticia)}>Editar</button>
                            <button onClick={() => onDelete(noticia.id, noticia.imagenStoragePath)} style={{ marginLeft: '5px' }}>Eliminar</button>

                            {/* ACCIONES DEL REPORTERO */}
                            {!isEditor && noticia.estado === 'Edición' && (
                                <button
                                    onClick={() => onFinish(noticia.id)}
                                    style={{ marginLeft: '5px', backgroundColor: '#007bff', color: 'white' }}
                                >
                                    Marcar Terminado
                                </button>
                            )}

                            {/* ACCIONES DEL EDITOR (RF-07) */}
                            {isEditor && (
                                <>
                                    {(noticia.estado === 'Terminado' || noticia.estado === 'Desactivado') && (
                                        <button
                                            onClick={() => onPublish(noticia.id, 'Publicado')}
                                            style={{ marginLeft: '5px', backgroundColor: 'green', color: 'white' }}
                                        >
                                            Publicar
                                        </button>
                                    )}
                                    {noticia.estado === 'Publicado' && (
                                        <button
                                            onClick={() => onPublish(noticia.id, 'Desactivado')}
                                            style={{ marginLeft: '5px', backgroundColor: 'orange', color: 'white' }}
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default NewsTable;