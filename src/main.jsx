import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // Necesitas el Router aquí si no está en App.jsx
// Pero si está en App.jsx, esta importación puede no ser necesaria.

// Importaciones de Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Definir un tema básico (opcional, puedes usar el default)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Aplica el tema y la base de estilos de MUI a toda la aplicación */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline reinicia los estilos para una base limpia y consistente */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);