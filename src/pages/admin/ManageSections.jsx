import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/ContextoAutenticacion';
import {
    obtenerSecciones,
    crearSeccion,
    actualizarSeccion,
    eliminarSeccion
} from '../../services/SeccionService'; // Funciones CRUD

const ManageSections = () => {
    const { userData, loading: authLoading } = useAuth();
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nombreNuevaSeccion, setNombreNuevaSeccion] = useState('');
    const [editando, setEditando] = useState(null); // ID de la sección que se está editando
    const [nombreEditado, setNombreEditado] = useState('');
    const [error, setError] = useState(null);

    // 1. Cargar las secciones al montar el componente
    const cargarSecciones = async () => {
        setLoading(true);
        try {
            const data = await obtenerSecciones();
            setSecciones(data);
            setError(null);
        } catch (e) {
            setError("Error al cargar las secciones.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            cargarSecciones();
        }
    }, [authLoading]);

    // 2. Control de Acceso (RF-08: Solo Editores pueden acceder a la gestión)
    if (authLoading || loading) {
        return <div>Cargando gestión de secciones...</div>;
    }

    if (userData?.rol !== 'Editor') {
        return <p className="error-message">Acceso denegado. Solo los Editores pueden gestionar secciones.</p>;
    }

    // 3. Crear Sección (RF-10)
    const handleCrearSeccion = async (e) => {
        e.preventDefault();
        if (!nombreNuevaSeccion.trim()) return;

        try {
            await crearSeccion(nombreNuevaSeccion.trim());
            setNombreNuevaSeccion('');
            await cargarSecciones(); // Recargar la lista
        } catch (e) {
            setError("Fallo al crear la sección.");
        }
    };

    // 4. Actualizar Sección (RF-10)
    const handleActualizarSeccion = async (e) => {
        e.preventDefault();
        if (!nombreEditado.trim() || !editando) return;

        try {
            await actualizarSeccion(editando, nombreEditado.trim());
            setEditando(null); // Cerrar modo edición
            setNombreEditado('');
            await cargarSecciones(); // Recargar la lista
        } catch (e) {
            setError("Fallo al actualizar la sección.");
        }
    };

    // 5. Eliminar Sección (RF-10)
    const handleEliminarSeccion = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta sección?")) return;

        try {
            await eliminarSeccion(id);
            await cargarSecciones(); // Recargar la lista
        } catch (e) {
            setError("Fallo al eliminar la sección. Verifica que no tenga noticias asociadas.");
        }
    };

    // 6. Iniciar Edición
    const iniciarEdicion = (seccion) => {
        setEditando(seccion.id);
        setNombreEditado(seccion.nombre);
    };

    return (
        <div className="container">
            <h2>Gestión de Secciones (Editor)</h2>

            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

            {/* Formulario de Creación (RF-10) */}
            <form onSubmit={handleCrearSeccion} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
                <h3>Crear Nueva Sección</h3>
                <input
                    type="text"
                    placeholder="Nombre de la nueva sección (e.g., Tecnología)"
                    value={nombreNuevaSeccion}
                    onChange={(e) => setNombreNuevaSeccion(e.target.value)}
                    required
                    style={{ padding: '10px', marginRight: '10px', width: '300px' }}
                />
                <button type="submit" style={{ padding: '10px' }}>Crear</button>
            </form>

            {/* Listado y Edición de Secciones (RF-10) */}
            <h3>Secciones Existentes</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {secciones.map((seccion) => (
                    <li key={seccion.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px dotted #eee' }}>

                        {editando === seccion.id ? (
                            // Modo Edición
                            <form onSubmit={handleActualizarSeccion}>
                                <input
                                    type="text"
                                    value={nombreEditado}
                                    onChange={(e) => setNombreEditado(e.target.value)}
                                    required
                                />
                                <button type="submit" style={{ marginLeft: '10px' }}>Guardar</button>
                                <button type="button" onClick={() => setEditando(null)} style={{ marginLeft: '10px' }}>Cancelar</button>
                            </form>
                        ) : (
                            // Modo Lectura
                            <>
                                <span>{seccion.nombre}</span>
                                <div>
                                    <button onClick={() => iniciarEdicion(seccion)} style={{ marginRight: '10px' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleEliminarSeccion(seccion.id)}>
                                        Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageSections;