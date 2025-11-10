import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Newspaper, Person, Phone, Email } from '@mui/icons-material';

const Footer = () => {
    return (
        <Box
            sx={{
                bgcolor: '#1a237e', // Azul oscuro profesional
                color: 'white',
                py: 5, // Más padding vertical
                mt: 5, // Margen superior para separarse de las tarjetas de noticias
                borderTop: '5px solid #00796b',
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        // En móvil (xs), será columna. En desktop (md), será fila (row)
                        flexDirection: { xs: 'column', md: 'row' },

                        // En desktop, usamos espacio entre ellos
                        justifyContent: 'space-between',

                        // En móvil, centramos horizontalmente todos los elementos (marca, contactos, copyright)
                        alignItems: { xs: 'center', md: 'flex-start' },

                        textAlign: { xs: 'center', md: 'left' },
                        gap: 4, // Separación entre columnas
                    }}
                >
                    {/* Sección 1: Marca */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Newspaper sx={{ mr: 1, fontSize: 30 }} />
                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                FuckNews VDL
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="#cfd8dc" sx={{ mt: 1 }}>
                            Plataforma de gestión de contenido.
                        </Typography>
                    </Box>

                    {/* Sección 2: Contactos */}
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold', borderBottom: '1px solid #00796b', pb: 0.5 }}>
                            Contacto de Soporte
                        </Typography>

                        {/* Contacto 1: Johnathan Vidal Espinosa */}
                        <Box sx={{ mb: 2 }}>
                            {/* Usamos justifyContent: 'center' en móvil para centrar el texto con el ícono */}
                            <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Person sx={{ fontSize: 16, mr: 1 }} />
                                Johnathan Vidal Espinosa
                            </Typography>
                            <Typography variant="body2" color="#cfd8dc" sx={{ pl: { xs: 0, md: 2 }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Email sx={{ fontSize: 14, mr: 1 }} />
                                johnathanvidal1309@gmail.com
                            </Typography>
                            <Typography variant="body2" color="#cfd8dc" sx={{ pl: { xs: 0, md: 2 }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Phone sx={{ fontSize: 14, mr: 1 }} />
                                3203203445
                            </Typography>
                        </Box>

                        {/* Contacto 2: Daniel Rueda */}
                        <Box>
                            {/* Usamos justifyContent: 'center' en móvil para centrar el texto con el ícono */}
                            <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Person sx={{ fontSize: 16, mr: 1 }} />
                                Daniel Rueda
                            </Typography>
                            <Typography variant="body2" color="#cfd8dc" sx={{ pl: { xs: 0, md: 2 }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Email sx={{ fontSize: 14, mr: 1 }} />
                                ingedanieluseche@gmail.com
                            </Typography>
                            <Typography variant="body2" color="#cfd8dc" sx={{ pl: { xs: 0, md: 2 }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Phone sx={{ fontSize: 14, mr: 1 }} />
                                3124860459
                            </Typography>
                        </Box>

                    </Box>

                    {/* Sección 3: Derechos de Autor */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="#cfd8dc">
                            © {new Date().getFullYear()} FuckNews VDL. Todos los derechos reservados.
                        </Typography>
                        <Typography variant="body2" color="#cfd8dc" sx={{ mt: 0.5 }}>
                            Desarrollado con el ❤️ por el equipo de FuckNews VDL.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;