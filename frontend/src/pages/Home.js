import React from 'react';
import { Box, Typography } from '@mui/material';
import { contentWidthSx } from '../styles/pageLayout';
import heroImage from '../assets/images/lago-hero.png';

const heroSection = {
  position: 'relative',
  minHeight: { xs: '60vh', md: '70vh' },
  display: 'flex',
  alignItems: 'center',
  backgroundImage: `url(${heroImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const heroOverlay = {
  position: 'absolute',
  inset: 0,
  background: {
    xs: 'linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.55))',
    md: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 100%)',
  },
};

const heroSpacing = {
  ...contentWidthSx,
  width: { xs: '80%', md: '50%' },
  mx: { xs: 'auto', md: 'unset' },
  ml: { md: '10%' },
  position: 'relative',
  color: '#fff',
  py: { xs: 4, sm: 6, md: 10 },
};

const welcomeSpacing = {
  ...contentWidthSx,
  mt: { xs: 3, sm: 4, md: 6 },
  mb: { xs: 1, sm: 2, md: 3 },
  p: { xs: 2, sm: 3, md: 5 },
};

const Home = () => {
  return (
    <div>
      <Box component="section" sx={heroSection}>
        <Box sx={heroOverlay} />
        <Box sx={heroSpacing}>
          <Typography variant="h1" component="h1" sx={{ fontSize: '4rem', mb: 2, color: 'inherit' }}>
            Lagos abiertos
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 3, color: 'inherit' }}>
            Conocer un lago es el primer paso para protegerlo.
          </Typography>
          <Typography variant="body1" sx={{ color: 'inherit' }}>
            Lagos Abiertos reúne información ambiental obtenida mediante sensores,
            investigación científica y colaboración ciudadana para monitorear la
            Laguna de Chichoj y poner esos datos al alcance de todas las personas.
          </Typography>
        </Box>
      </Box>
      <Box sx={welcomeSpacing}>
        <Typography variant="body1">
          Bienvenidos al proyecto "Generación de datos abiertos a través de ciencia ciudadana para monitoreo de sistemas lenticos vulnerables". Este esfuerzo colaborativo entre la Facultad de Ingeniería y la Facultad de Ciencias Químicas y Farmacia de la Universidad de San Carlos de Guatemala, busca desarrollar metodologías y procesos tecnológicos innovadores para el monitoreo de ecosistemas acuáticos vulnerables, con un enfoque especial en la Laguna de Chichoj, Alta Verapaz, Guatemala.
        </Typography>
      </Box>
    </div>
  );
}

export default Home;