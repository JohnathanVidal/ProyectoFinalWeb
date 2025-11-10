import {
    db
} from '../Context/ContextoAutenticacion';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDoc,
    orderBy
} from 'firebase/firestore';

// -----------------------------------------------------------
// CONFIGURACIÓN Y FUNCIONES DE CLOUDINARY
// -----------------------------------------------------------
const CLOUD_NAME = 'dbdkdszoe';
const UPLOAD_PRESET_NAME = 'ml_default'; // Usamos el preset 'ml_default'

/**
 * Función auxiliar para subir la imagen a Cloudinary.
 */
const subirImagen = async (imagenFile) => {

    if (!imagenFile) return {
        url: null,
        publicId: null
    };

    const formData = new FormData();


    formData.append('file', imagenFile);


    formData.append('upload_preset', UPLOAD_PRESET_NAME);


    formData.append('folder', 'noticias_cms');

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {

        const response = await fetch(url, {

            method: 'POST',

            body: formData,

        });


        if (!response.ok) {

            const errorData = await response.json();

            console.error("Cloudinary error data:", errorData);

            throw new Error(`Fallo en la subida a Cloudinary: ${errorData.error.message || 'Error desconocido'}`);

        }


        const data = await response.json();


        return {

            url: data.secure_url,

            publicId: data.public_id // ID necesario para referencia en Firestore

        };


    } catch (error) {

        console.error("Error al subir la imagen a Cloudinary:", error);

        throw error;

    }
};

/**
 * Función auxiliar para eliminar la imagen de Cloudinary. (Solo logging en FrontEnd)
 * Para una implementación en producción, esta función debería ser llamada desde un Backend seguro.
 */
const eliminarImagenCloudinary = async (publicId) => {
    // console.warn(`La eliminación real de la imagen con Public ID: ${publicId} debe hacerse desde un backend seguro.`);
    return true;
};

// ------------------------------------------------------
// GESTIÓN DE NOTICIAS (CRUD con Cloudinary para imágenes)
// ------------------------------------------------------
const NOTICIAS_COLLECTION = 'noticias';

/**
 * Crea una nueva noticia en Firestore, subiendo la imagen a Cloudinary.
 */
export const crearNoticia = async (data, imagenFile, autorId) => {

    try {

        // 1. Subida de imagen a Cloudinary

        const imagenData = await subirImagen(imagenFile);


        const nuevaNoticia =

        {

            ...data,

            // IMPORTANTE: Mantenemos el campo 'autor' para guardar el ID.

            autor: autorId,

            imagenUrl: imagenData.url,

            imagenPublicId: imagenData.publicId,

            fechaCreacion: new Date(),

            fechaActualizacion: new Date(),

            estado: 'Edición', // Estado inicial (RF-07)

        };


        // 2. Agrega la noticia a la colección 'noticias'

        await addDoc(collection(db, NOTICIAS_COLLECTION), nuevaNoticia);


        return {

            success: true

        };


    } catch (error) {


        console.error("Error al crear la noticia:", error);


        throw error;


    }
};

// ------------------------------------------------------
// OBTENER NOTICIAS
/**
 * Obtiene todas las noticias (para el Editor) o filtra por autor (para el Reportero).
 */
export const obtenerNoticiasAdministracion = async (rol, autorId) => {

    let q;

    const noticiasRef = collection(db, NOTICIAS_COLLECTION);

    // CORRECCIÓN CLAVE: Se cambia 'autorId' por 'autor' para coincidir con Firestore
    if (rol === 'Reportero' && autorId) {


        // RF-05: El reportero solo ve sus propias noticias.

        // REQUIERE ÍNDICE: autor (Ascending) + fechaCreacion (Descending)

        q = query(

            noticiasRef,

            where('autor', '==', autorId),

            orderBy('fechaCreacion', 'desc')

        );


    } else {


        // Lógica por defecto para Editor

        q = query(noticiasRef, orderBy('fechaCreacion', 'desc'));


    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({


        id: doc.id,

        ...doc.data(),

        // Aseguramos que la fecha sea manejable en JS y formateable en el componente

        fechaCreacion: doc.data().fechaCreacion?.toDate ? doc.data().fechaCreacion.toDate() : doc.data().fechaCreacion,

        fechaActualizacion: doc.data().fechaActualizacion?.toDate ? doc.data().fechaActualizacion.toDate() : doc.data().fechaActualizacion,


    }));
};

/**
 *✅ FUNCIÓN CLAVE (RF-07): Obtiene solo noticias en estado 'Terminado' para el Editor.
 * REQUIERE ÍNDICE: estado (Ascending) + fechaCreacion (Descending)
 */
export const obtenerNoticiasPendientesPublicacion = async () => {
    try {


        const noticiasRef = collection(db, NOTICIAS_COLLECTION);


        // Filtra por noticias que están en estado 'Terminado'

        const q = query(

            noticiasRef,

            where('estado', '==', 'Terminado'),

            orderBy('fechaCreacion', 'desc')

        );


        // LOG DE DEPURACIÓN

        console.log("DEBUG SERVICE: Ejecutando consulta de cola: estado=='Terminado'...");


        const querySnapshot = await getDocs(q);

        const noticias = querySnapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data(),

            fechaCreacion: doc.data().fechaCreacion?.toDate ? doc.data().fechaCreacion.toDate() : doc.data().fechaCreacion,

        }));


        // LOG DE DEPURACIÓN CRÍTICO

        console.log(`DEBUG SERVICE: Noticias pendientes encontradas para 'Terminado': ${noticias.length}`);


        return noticias;


    } catch (error) {


        console.error("Error al obtener noticias pendientes de publicación:", error);


        return [];


    }
};

/**
 *✅ FUNCIÓN CORREGIDA (RF-11): Obtiene solo noticias en estado 'Publicado' para el frontend público.
 * REQUIERE ÍNDICE: estado (Ascending) + fechaActualizacion (Descending)
 */
export const obtenerNoticiasPublicadas = async () => {
    const q = query(

        collection(db, NOTICIAS_COLLECTION),

        where('estado', '==', 'Publicado'),

        orderBy('fechaActualizacion', 'desc') // Mostrar las más recientes primero

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data(),

        fechaActualizacion: doc.data().fechaActualizacion?.toDate ? doc.data().fechaActualizacion.toDate() : doc.data().fechaActualizacion,

        fechaCreacion: doc.data().fechaCreacion?.toDate ? doc.data().fechaCreacion.toDate() : doc.data().fechaCreacion,

    }));
};

// ------------------------------------------------------
// ACTUALIZAR NOTICIA Y CONTROL DE ESTADOS
/**
 * Actualiza los datos de una noticia.
 * @param {string} id - ID del documento a actualizar.
 * @param {object} nuevosDatos - Campos de texto a actualizar.
 * @param {File} [imagenFile=null] - Nuevo archivo de imagen (opcional).
 * @param {string} [currentPublicId=null] - ID público de la imagen actual a eliminar (opcional).
 */
export const actualizarNoticia = async (id, nuevosDatos, imagenFile = null, currentPublicId = null) => {
    const docRef = doc(db, NOTICIAS_COLLECTION, id);
    const updates = {
        ...nuevosDatos,
        fechaActualizacion: new Date()
    };

    try {
        if (imagenFile) {
            // 1. Subir la nueva imagen
            const imagenData = await subirImagen(imagenFile);

            // 2. Añadir la URL e ID público a las actualizaciones de Firestore
            updates.imagenUrl = imagenData.url;
            updates.imagenPublicId = imagenData.publicId;

            // 3. Eliminar la imagen anterior de Cloudinary (si existía)
            if (currentPublicId) {
                await eliminarImagenCloudinary(currentPublicId);
            }
        } else {
            // Si no hay imagenFile, mantenemos la imagenUrl e imagenPublicId existentes en Firestore (no se tocan)
        }

        // 4. Actualizar el documento en Firestore
        await updateDoc(docRef, updates);

    } catch (error) {
        console.error("Error al actualizar la noticia:", error);
        throw error;
    }
};

/**
 * Función específica para que el Editor cambie el estado de publicación (RF-07).
 */
export const cambiarEstadoPublicacion = async (id, nuevoEstado) => {

    if (nuevoEstado !== 'Publicado' && nuevoEstado !== 'Desactivado') {

        throw new Error("Estado no permitido para publicación editorial.");

    }

    // Usamos actualizarNoticia con solo el estado
    await actualizarNoticia(id, {
        estado: nuevoEstado
    });
};

/**
 * Función para que el Reportero marque como Terminado (RF-07).
 */
export const marcarComoTerminado = async (id) => {

    // Usamos actualizarNoticia con solo el estado
    await actualizarNoticia(id, {
        estado: 'Terminado'
    });
};

// ------------------------------------------------------
// ELIMINAR NOTICIA
/**
 * Elimina una noticia y su referencia de imagen.
 */
export const eliminarNoticia = async (id, imagenPublicId) => {

    try {


        // 1. Eliminar la imagen de Cloudinary (solo referencia, la eliminación real requiere BE)

        if (imagenPublicId) {


            await eliminarImagenCloudinary(imagenPublicId);


        }


        // 2. Eliminar el documento de Firestore

        const docRef = doc(db, NOTICIAS_COLLECTION, id);


        await deleteDoc(docRef);


        return {

            success: true

        };


    } catch (error) {


        console.error("Error al eliminar la noticia:", error);


        throw error;


    }
};

// ------------------------------------------------------
// NOTICIA INDIVIDUAL
/**
 * Obtiene una única noticia por su ID.
 */
export const obtenerNoticiaPorId = async (id) => {

    try {


        const docRef = doc(db, NOTICIAS_COLLECTION, id);


        const docSnap = await getDoc(docRef);


        if (docSnap.exists()) {


            return {

                id: docSnap.id,

                ...docSnap.data()

            };


        } else {


            return null; // Noticia no encontrada


        }


    } catch (error) {


        console.error("Error al obtener la noticia:", error);


        throw error;


    }
};