import React from 'react';
import { Box, Typography } from '@mui/material';
import { contentWidthSx } from '../styles/pageLayout';

const sectionSpacing = {
  ...contentWidthSx,
  mt: { xs: 3, sm: 4, md: 6 },
  mb: { xs: 3, sm: 4, md: 6 },
  p: { xs: 2, sm: 3, md: 5 },
};

const About = () => {
    return (
        <div>
        <Box sx={sectionSpacing}>
          <Typography variant="h4" sx={{ mb: 4 }}>El proyecto</Typography>
          <Typography variant="body1" sx={{ mb: 6 }}>El proyecto "Generación de datos abiertos a través de ciencia ciudadana para monitoreo de sistemas lenticos vulnerables" surge como una iniciativa interdisciplinaria que combina la experticia de la Facultad de Ingeniería y la Facultad de Ciencias Químicas y Farmacia de la Universidad de San Carlos de Guatemala. Su principal enfoque es integrar a la comunidad en la recopilación y análisis de datos ambientales, promoviendo la educación y la participación ciudadana en la protección y estudio de ecosistemas acuáticos vulnerables.
Este proyecto no solo busca aportar a la conservación ambiental, sino también fomentar una cultura de ciencia abierta y colaborativa que permita a los ciudadanos ser actores clave en la gestión sostenible de sus recursos naturales.</Typography>

          <Typography variant="h4" sx={{ mb: 2 }}>Objetivo General</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>El objetivo general del proyecto es desarrollar metodologías y procesos tecnológicos para obtener datos abiertos a través de ciencia ciudadana para monitoreo de sistemas acuáticos vulnerables utilizando como caso de estudio la Laguna de Chichoj. Objetivos Específicos</Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>Identificación y Desarrollo Metodológico:</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>Elaborar y optimizar una metodología accesible y tecnológica que permita a los ciudadanos contribuir al monitoreo fisicoquímico de los sistemas lenticos.</Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>Desarrollo Tecnológico:</Typography>
          <Typography variant="body1" sx={{ mb: 6 }}>Implementar procesos tecnológicos con estándares abiertos, incluyendo el uso de aplicaciones móviles y software especializado, para facilitar la recolección y el análisis de datos ambientales.</Typography>

          <Typography variant="h4" sx={{ mb: 4 }}>Financiamiento</Typography>
          <Typography variant="body1">Este proyecto es posible gracias al financiamiento de la Secretaría General de Ciencia y Tecnología de Guatemala, bajo el código SinerCyT 03-2022.</Typography>
        </Box>

      </div>
    );
}

export default About;
