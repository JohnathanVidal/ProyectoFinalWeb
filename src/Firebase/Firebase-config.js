import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase, usando los valores DIRECTOS
const firebaseConfig = {
    apiKey: "AIzaSyDJvFyhYIfH-htmoPwM9sAI8tdvCewe6OQ",
    authDomain: "proyectofinalweb-db306.firebaseapp.com",
    projectId: "proyectofinalweb-db306",
    storageBucket: "proyectofinalweb-db306.firebasestorage.app",
    messagingSenderId: "144194702611",
    appId: "1:144194702611:web:28617a5ea3e1f4a8319ee6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);