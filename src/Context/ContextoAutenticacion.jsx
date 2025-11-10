import React, {
    createContext, useContext, useEffect, useState
} from 'react';
import {
    initializeApp,
    getApps,
    getApp
} from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ======================================================================
// CONFIGURACIÓN DE FIREBASE 
// ======================================================================
const firebaseConfig =
{
    // Sus claves de configuración
    apiKey: "AIzaSyDJvFyhYIfH-htmoPwM9sAI8tdvCewe6OQ",
    authDomain: "proyectofinalweb-db306.firebaseapp.com",
    projectId: "proyectofinalweb-db306",
    storageBucket: "proyectofinalweb-db306.firebasestorage.app",
    messagingSenderId: "144194702611",
    appId: "1:144194702611:web:28617a5ea3e1f4a83199ee6"
};

// Inicialización de Firebase Condicional
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exportamos las referencias para los Servicios (para uso en NoticiaService, SeccionService, etc.)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Funciones de utilidad de datos

/**
 * Registra el rol del usuario recién creado en la colección 'users' de Firestore.
 */
const registrarUsuarioEnFirestore = async (uid, email, rol) => {
    try {
        await setDoc(doc(db, "users", uid), {
            email: email,
            rol: rol || 'Reportero', // Usa el rol pasado o 'Reportero' por defecto
            createdAt: new Date()
        });
    } catch (error) {
        console.error("Error al guardar usuario en Firestore:", error);
        throw error;
    }
};

/**
 * Obtiene los datos del usuario (incluido el rol) de Firestore.
 */
const obtenerDatosUsuario = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        // Mapeamos 'rol' (Firestore) a 'role' (Necesario para RutaProtegida)
        return {
            ...data,
            role: data.rol,
        };
    }
    // Si no existe, devolvemos un objeto base.
    return { role: undefined, rol: undefined };
};

// Contexto de Autenticación
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {

    const [currentUser, setCurrentUser] = useState(null); // Objeto de Firebase Auth
    const [userData, setUserData] = useState(null);       // Datos de Firestore (incluye rol)
    const [isAuthReady, setIsAuthReady] = useState(false); // Bandera para indicar que la verificación inicial ha terminado


    // Funciones de Autenticación
    const signup = async (email, password, rol) => {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        // Llama a la función para guardar el rol en Firestore
        await registrarUsuarioEnFirestore(response.user.uid, email, rol);
        return response.user;
    };

    const login = async (email, password) => {
        const response = await signInWithEmailAndPassword(auth, email, password);
        return response.user;
    };

    const logout = () => {
        return signOut(auth);
    };


    // EFECTO CENTRAL: Observa la autenticación y carga el rol
    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            setCurrentUser(user);

            if (user) {
                try {
                    // Carga los datos de Firestore que contienen el rol
                    const data = await obtenerDatosUsuario(user.uid);
                    setUserData({ ...data, uid: user.uid });
                } catch (error) {
                    console.error("Fallo al obtener datos de usuario/rol de Firestore:", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }

            // Marcamos el sistema de autenticación como listo después de la primera comprobación
            if (!isAuthReady) {
                setIsAuthReady(true);
            }
        });

        // Cleanup: deja de escuchar cuando el componente se desmonta
        return () => unsubscribe();

    }, [isAuthReady]);


    // Valor del contexto
    // Determina si el usuario tiene permisos de Editor (o Admin, si se implementa)
    const isEditor = userData?.rol === 'Editor' || userData?.rol === 'Admin';

    const value = {
        currentUser,
        userData,
        isAuthReady,
        isEditor,
        signup,
        login,
        logout,
    };


    return (
        <AuthContext.Provider value={value}>
            {/* Solo renderiza los hijos cuando la autenticación esté lista para evitar parpadeos */}
            {isAuthReady ? children : null}
        </AuthContext.Provider>

    );
};