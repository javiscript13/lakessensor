import React from 'react';
import { Paper, Typography } from '@mui/material';

const mainParagraph = {
  margin: 20,
  marginTop: 10,
  marginBottom: 10,
  padding: 10,
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