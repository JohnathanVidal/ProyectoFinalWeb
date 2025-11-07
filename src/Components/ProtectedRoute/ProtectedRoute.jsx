import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/ContextoAutenticacion'; 

// Este componente recibe la página (componente) que debe proteger
const ProtectedRoute = ({ component: Component }) => {
    // Asegúrate de que esta ruta sea correcta: '../context/ContextoAutenticacion'
    const { user, loading } = useAuth(); // Obtenemos el usuario y el estado de carga

    if (loading) {
        // Muestra un loader mientras se verifica el estado de Firebase Auth
        return <div>Verificando autenticación...</div>;
    }

    // RF-02: Si el usuario existe, renderiza el componente (Dashboard, ManageNews, etc.)
    if (user) {
        return <Component />;
    }

    // Si no está autenticado, redirige al login
    return <Navigate to="/login" />;
};

export default ProtectedRoute;