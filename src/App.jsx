import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes de Contexto y Layout
import { AuthProvider } from './Context/ContextoAutenticacion';
// FIX: La carpeta se cambia de 'Components' a 'components' (estándar React en minúsculas)
import RutaProtegida from './components/common/RutaProtegida';

// Páginas Públicas
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';
import NoticiaDetalle from './pages/public/NoticiaDetalle';

// Páginas Administrativas
import Dashboard from './pages/admin/Dashboard';
import ManageNews from './pages/admin/ManageNews';
import ManageSections from './pages/admin/ManageSections';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Rutas Públicas (RF-11) */}
          <Route path="/" element={<Home />} />
          <Route path="/noticia/:id" element={<NoticiaDetalle />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas (RF-02) */}
          <Route element={<RutaProtegida />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/noticias" element={<ManageNews />} />
            <Route path="/admin/secciones" element={<ManageSections />} />
          </Route>

          {/* Manejo de 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;