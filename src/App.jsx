import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { Box, Typography } from '@mui/material';

// Rutas Públicas
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import NoticiaDetalle from './pages/public/NoticiaDetalle'; // Importación AÑADIDA

// Componentes de Administracion
import Dashboard from './pages/admin/Dashboard';
import ManageSections from './pages/admin/ManageSections';
import ManageNews from './pages/admin/ManageNews';

// Componentes de Autenticación y Layout
import { AuthProvider } from './Context/ContextoAutenticacion';
import RutaProtegida from './Components/common/RutaProtegida';
import Header from './Components/Header/Header';

function App() {
  return (

    <Router>

      <AuthProvider>

        <Header />


        {/* Usamos Box para el contenido principal */}

        <Box component="main" sx={{ p: 3 }}>

          <Routes>

            {/* Rutas Públicas */}

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            {/* RUTA AÑADIDA: Detalle de Noticia */}
            <Route path="/noticia/:id" element={<NoticiaDetalle />} />


            {/* RUTA PROTEGIDA: DASHBOARD (HOME ADMIN) */}

            <Route
              path="/admin"
              element={
                // DASHBOARD es para Reporteros Y Editores
                <RutaProtegida allowedRoles={['Reportero', 'Editor']}>

                  <Dashboard />

                </RutaProtegida>
              }
            />


            {/* RUTA PROTEGIDA: GESTIÓN DE NOTICIAS */}

            <Route
              path="/admin/noticias"
              element={
                // CORRECCIÓN CLAVE: Permite acceso a Reporteros (para crear) Y Editores (para publicar/gestionar).
                <RutaProtegida allowedRoles={['Reportero', 'Editor']}>

                  <ManageNews />

                </RutaProtegida>
              }
            />


            {/* RUTA PROTEGIDA: GESTIÓN DE SECCIONES */}

            <Route
              path="/admin/secciones"
              element={
                // Solo Editores pueden gestionar secciones
                <RutaProtegida allowedRoles={['Editor']}>

                  <ManageSections />

                </RutaProtegida>
              }
            />


            {/* Manejo de 404 para cualquier otra ruta */}

            <Route path="*" element={

              <Box mt={5} textAlign="center">

                <Typography variant="h4" color="error">404 - Página no encontrada</Typography>

              </Box>
            }
            />


          </Routes>

        </Box>

      </AuthProvider>

    </Router>

  );
}

export default App;