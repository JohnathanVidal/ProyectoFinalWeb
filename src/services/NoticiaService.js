import { db, storage } from '../Firebase/Firebase-config';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const NOTICIAS_COLLECTION = 'noticias';

//------------------------------------------------------
// Servicio para crear una noticia
// Función auxiliar para subir la imagen a Firebase Storage (RNF-11)
const subirImagen = async (imagenFile) => {
    if (!imagenFile) return null;

    // Crea una referencia única en Storage
    const storageRef = ref(storage, `imagenes/${Date.now()}-${imagenFile.name}`);

    // Sube el archivo
    await uploadBytes(storageRef, imagenFile);

    // Obtiene la URL pública
    const url = await getDownloadURL(storageRef);
    return { url, ref: storageRef.fullPath };
};

/**
 * Crea una nueva noticia en Firestore.
 * @param {object} data - Datos del formulario de la noticia.
 * @param {File} imagenFile - Archivo de imagen a subir.
 * @param {string} autorId - ID del usuario (Reportero) que la crea.
 */
export const crearNoticia = async (data, imagenFile, autorId) => {
    try {
        const imagenData = await subirImagen(imagenFile); // Subida de imagen (RF-06, RNF-11)

        const nuevaNoticia = {
            ...data,
            autor: autorId,
            imagenUrl: imagenData ? imagenData.url : null,
            imagenStoragePath: imagenData ? imagenData.ref : null,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            estado: 'Edición', // Estado inicial (RF-07)
        };

        // Agrega la noticia a la colección 'noticias'
        await addDoc(collection(db, NOTICIAS_COLLECTION), nuevaNoticia);
        return { success: true };

    } catch (error) {
        console.error("Error al crear la noticia:", error);
        throw error;
    }
};

//------------------------------------------------------
// leer noticias
/**
 * Obtiene todas las noticias (para el Editor) o filtra por autor (para el Reportero).
 * @param {string} rol - Rol del usuario ('Editor' o 'Reportero').
 * @param {string} [autorId] - ID del autor si el rol es 'Reportero'.
 */
export const obtenerNoticiasAdministracion = async (rol, autorId) => {
    let q;
    if (rol === 'Reportero' && autorId) {
        // RF-05: Reportero solo ve sus noticias
        q = query(collection(db, NOTICIAS_COLLECTION), where('autor', '==', autorId));
    } else {
        // RF-05: Editor ve todas las noticias
        q = collection(db, NOTICIAS_COLLECTION);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion.toDate(), // Convierte Firestore Timestamp
        fechaActualizacion: doc.data().fechaActualizacion.toDate(),
    }));
};

/**
 * Obtiene solo noticias en estado 'Publicado' para el frontend público (RF-11).
 */
export const obtenerNoticiasPublicadas = async () => {
    const q = query(
        collection(db, NOTICIAS_COLLECTION),
        where('estado', '==', 'Publicado')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


//------------------------------------------------------
// actualizar noticia y control de estados
/**
 * Actualiza los datos de una noticia.
 * @param {string} id - ID del documento en Firestore.
 * @param {object} nuevosDatos - Datos a actualizar (puede incluir estado, título, etc.).
 */
export const actualizarNoticia = async (id, nuevosDatos) => {
    const docRef = doc(db, NOTICIAS_COLLECTION, id);
    await updateDoc(docRef, {
        ...nuevosDatos,
        fechaActualizacion: new Date()
    });
};

/**
 * Función específica para que el Editor cambie el estado de publicación (RF-07).
 * @param {string} id - ID del documento.
 * @param {string} nuevoEstado - 'Publicado' o 'Desactivado'.
 */
export const cambiarEstadoPublicacion = async (id, nuevoEstado) => {
    // Solo se permiten los estados gestionados por el Editor
    if (nuevoEstado !== 'Publicado' && nuevoEstado !== 'Desactivado') {
        throw new Error("Estado no permitido para publicación editorial.");
    }

    // RF-07: Publicado y Desactivado son responsabilidad del Editor
    await actualizarNoticia(id, { estado: nuevoEstado });
};

/**
 * Función para que el Reportero marque como Terminado (RF-07).
 * @param {string} id - ID del documento.
 */
export const marcarComoTerminado = async (id) => {
    // RF-07: Terminado es responsabilidad del Reportero
    await actualizarNoticia(id, { estado: 'Terminado' });
};

//------------------------------------------------------
// eliminar noticia
/**
 * Elimina una noticia y su imagen asociada.
 * @param {string} id - ID del documento en Firestore.
 * @param {string} imagenStoragePath - La ruta del archivo en Storage.
 */
export const eliminarNoticia = async (id, imagenStoragePath) => {
    try {
        // 1. Eliminar la imagen de Storage (RF-09, RNF-11)
        if (imagenStoragePath) {
            const imagenRef = ref(storage, imagenStoragePath);
            await deleteObject(imagenRef);
        }

        // 2. Eliminar el documento de Firestore
        const docRef = doc(db, NOTICIAS_COLLECTION, id);
        await deleteDoc(docRef);

        return { success: true };

    } catch (error) {
        console.error("Error al eliminar la noticia:", error);
        // Nota: El error de Storage puede ser 'object-not-found', lo cual se puede ignorar
        // si solo queremos que el documento se borre.
        throw error;
    }
};

//------------------------------------------------------
// noticia individual
// Dentro de src/services/NoticiaService.js, junto a las demás funciones:

/**
 * Obtiene una única noticia por su ID.
 * @param {string} id - ID del documento en Firestore.
 */
export const obtenerNoticiaPorId = async (id) => {
    try {
        const docRef = doc(db, NOTICIAS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null; // Noticia no encontrada
        }
    } catch (error) {
        console.error("Error al obtener la noticia:", error);
        throw error;
    }
};