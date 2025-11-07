import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../Context/ContextoAutenticacion'; // Instancia de Firestore

const SECCIONES_COLLECTION = 'secciones';

/**
 * Obtiene todas las secciones existentes, ordenadas por nombre.
 * @returns {Promise<Array>} Lista de objetos de sección.
 */
export const obtenerSecciones = async () => {
    try {
        const seccionesCol = collection(db, SECCIONES_COLLECTION);
        const q = query(seccionesCol, orderBy('nombre', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener las secciones:", error);
        return [];
    }
};

/**
 * Crea una nueva sección.
 * @param {string} nombre - Nombre de la nueva sección.
 * @param {string} estado - Estado inicial de la sección ('Activa' o 'Inactiva').
 * @returns {Promise<string>} El ID del documento creado.
 */
export const crearSeccion = async (nombre, estado) => {
    try {
        const docRef = await addDoc(collection(db, SECCIONES_COLLECTION), {
            nombre,
            estado,
            createdAt: new Date(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error al crear la sección:", error);
        throw new Error("Fallo al guardar la sección.");
    }
};

/**
 * Actualiza una sección existente.
 * @param {string} id - ID del documento de la sección.
 * @param {object} data - Datos a actualizar (nombre y/o estado).
 */
export const actualizarSeccion = async (id, data) => {
    try {
        const docRef = doc(db, SECCIONES_COLLECTION, id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error al actualizar la sección:", error);
        throw new Error("Fallo al actualizar la sección.");
    }
};

/**
 * Elimina una sección.
 * @param {string} id - ID del documento de la sección.
 */
export const eliminarSeccion = async (id) => {
    try {
        const docRef = doc(db, SECCIONES_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error al eliminar la sección:", error);
        throw new Error("Fallo al eliminar la sección.");
    }
};