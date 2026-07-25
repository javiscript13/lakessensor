import React from 'react';
import { Paper, Typography } from '@mui/material';

const mainParagraph = {
  mx: { xs: 1, sm: 3, md: 5 },
  my: { xs: 1, sm: 2, md: 3 },
  p: { xs: 2, sm: 3, md: 5 },
};

const Home = () => {
  return (
    <div>
      <Paper 
        elevation={3}  
        sx={mainParagraph}
      >
        <Typography variant="h4">Bienvenidos al proyecto "Generación de datos abiertos a través de ciencia ciudadana para monitoreo de sistemas lenticos vulnerables". Este esfuerzo colaborativo entre la Facultad de Ingeniería y la Facultad de Ciencias Químicas y Farmacia de la Universidad de San Carlos de Guatemala, busca desarrollar metodologías y procesos tecnológicos innovadores para el monitoreo de ecosistemas acuáticos vulnerables, con un enfoque especial en la Laguna de Chichoj, Alta Verapaz, Guatemala.</Typography>
      </Paper>
    </div>
  );
}

export default Home;