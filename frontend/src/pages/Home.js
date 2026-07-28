import React from 'react';
import { Box, Typography } from '@mui/material';
import { contentWidthSx } from '../styles/pageLayout';

const heroSpacing = {
  ...contentWidthSx,
  mt: { xs: 4, sm: 6, md: 10 },
  mb: { xs: 2, sm: 3, md: 4 },
  p: { xs: 2, sm: 3, md: 5 },
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
      <Box sx={heroSpacing}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '4rem', mb: 2 }}>
          Lagos abiertos
        </Typography>
        <Typography variant="h5" component="p" sx={{ mb: 3 }}>
          Conocer un lago es el primer paso para protegerlo.
        </Typography>
        <Typography variant="body1">
          Lagos Abiertos reúne información ambiental obtenida mediante sensores,
          investigación científica y colaboración ciudadana para monitorear la
          Laguna de Chichoj y poner esos datos al alcance de todas las personas.
        </Typography>
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