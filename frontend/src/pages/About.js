import React from 'react';
import { Paper, Typography } from '@mui/material';

const mainParagraph = {
  margin: 20,
  marginTop: 5,
  marginBottom: 5,
  padding: 10,
};

const About = () => {
    return (
        <div>
        <Paper 
          elevation={3}  
          sx={mainParagraph}
        >
          <Typography variant="body1">El proyecto "Generación de datos abiertos a través de ciencia ciudadana para monitoreo de sistemas lenticos vulnerables" surge como una iniciativa interdisciplinaria que combina la experticia de la Facultad de Ingeniería y la Facultad de Ciencias Químicas y Farmacia de la Universidad de San Carlos de Guatemala. Su principal enfoque es integrar a la comunidad en la recopilación y análisis de datos ambientales, promoviendo la educación y la participación ciudadana en la protección y estudio de ecosistemas acuáticos vulnerables.
Este proyecto no solo busca aportar a la conservación ambiental, sino también fomentar una cultura de ciencia abierta y colaborativa que permita a los ciudadanos ser actores clave en la gestión sostenible de sus recursos naturales.</Typography>
        </Paper>
        <Paper 
          elevation={3}  
          sx={mainParagraph}
        >
          <Typography variant="h4">Objetivo General</Typography>
          <Typography variant="body1">El objetivo general del proyecto es desarrollar metodologías y procesos tecnológicos para obtener datos abiertos a través de ciencia ciudadana para monitoreo de sistemas acuáticos vulnerables utilizando como caso de estudio la Laguna de Chichoj. Objetivos Específicos</Typography>
          <br/>
          <Typography variant="h6">Identificación y Desarrollo Metodológico:</Typography>
          <Typography variant="body1">Elaborar y optimizar una metodología accesible y tecnológica que permita a los ciudadanos contribuir al monitoreo fisicoquímico de los sistemas lenticos.</Typography>
          <br/>
          <Typography variant="h6">Desarrollo Tecnológico:</Typography>
          <Typography variant="body1">Implementar procesos tecnológicos con estándares abiertos, incluyendo el uso de aplicaciones móviles y software especializado, para facilitar la recolección y el análisis de datos ambientales.</Typography>

        </Paper>
        <Paper 
          elevation={3}  
          sx={mainParagraph}
        >
          <Typography variant="h4">Financiamiento</Typography>
          <Typography variant="body1">Este proyecto es posible gracias al financiamiento de la Secretaría General de Ciencia y Tecnología de Guatemala, bajo el código SinerCyT 03-2022.</Typography>

        </Paper>

      </div>
    );
}

export default About;