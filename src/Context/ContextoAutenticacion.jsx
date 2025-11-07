import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// --- Configuración de Firebase (DATOS REALES INYECTADOS) ---
// NOTA: Esta configuración es la proporcionada por el usuario.
const firebaseConfig = {
    apiKey: "AIzaSyDJvFyhYIfH-htmoPwM9sAI8tdvCewe6OQ",
    authDomain: "proyectofinalweb-db306.firebaseapp.com",
    projectId: "proyectofinalweb-db306",
    storageBucket: "proyectofinalweb-db306.firebasestorage.app",
    messagingSenderId: "144194702611",
    appId: "1:144194702611:web:28617a5ea3e1f4a8319ee6"
};

// Variable de autenticación custom (proporcionada por el entorno, si existe)
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let auth;
let db;
let configError = null;

// Lógica de inicialización segura para evitar fallos de API Key
try {
    // Si la configuración tiene las claves mínimas, inicializamos
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        configError = "Advertencia: Configuración de Firebase incompleta. La autenticación fallará.";
        console.warn(configError);
    }
} catch (e) {
    configError = "Error: Fallo al inicializar Firebase. Revisa la configuración.";
    console.error(configError, e);
}

// Definición del Contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor de Contexto
export const AuthProvider = ({ children }) => {
    // isAuthenticated: True si hay un usuario logueado
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // isAuthReady: True después de la verificación inicial de Firebase (evita flasheo a login)
    const [isAuthReady, setIsAuthReady] = useState(false);
    // userData: Contiene el uid, email y el rol del usuario (RF-03)
    const [userData, setUserData] = useState(null);

    // Función para obtener el rol del usuario desde Firestore (RF-03)
    const getRoleFromFirestore = async (uid) => {
        // Si DB no se inicializó, devolvemos el rol por defecto.
        if (!db) return 'Reportero';
        try {
            // Colección 'users' a nivel raíz para almacenar roles.
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // RF-03: Asume que el rol se guarda en el campo 'rol'
                return docSnap.data().rol || 'Reportero';
            }
            return 'Reportero'; // Rol por defecto si no se encuentra
        } catch (error) {
            console.error("Error al obtener rol de Firestore:", error);
            return 'Reportero';
        }
    };

    // Efecto principal de autenticación
    useEffect(() => {
        // Si hubo un error de configuración, evitamos cualquier operación de Auth/DB
        if (configError || !auth) {
            setIsAuthReady(true);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Si el usuario está logueado
                const rol = await getRoleFromFirestore(user.uid);

                setUserData({
                    uid: user.uid,
                    email: user.email,
                    rol: rol
                });
                setIsAuthenticated(true);
            } else {
                // No hay usuario logueado
                setIsAuthenticated(false);
                setUserData(null);
            }
            // Marcamos la autenticación como lista después de la primera verificación
            setIsAuthReady(true);
        });

        // Autenticación inicial con Custom Token (si existe)
        if (initialAuthToken && auth && !auth.currentUser) {
            signInWithCustomToken(auth, initialAuthToken).catch(error => {
                console.error("Error en la autenticación inicial con token:", error);
            });
        }

        return () => unsubscribe(); // Limpiar el listener al desmontar
    }, []);

    // Mostrar un mensaje de error si la inicialización de Firebase falló
    if (configError && !auth) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                <p>Error Crítico de Firebase:</p>
                <p>{configError}</p>
                <p>La aplicación no puede continuar sin una inicialización correcta de Firebase.</p>
            </div>
        );
    }

    // El objeto de contexto que se pasa a los componentes
    const contextValue = {
        isAuthenticated,
        isAuthReady,
        userData,
        authInstance: auth,
        dbInstance: db
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Exportamos también la instancia de db y auth (pueden ser undefined si la inicialización falló)
export { db, auth };