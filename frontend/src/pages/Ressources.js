import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { contentWidthSx } from '../styles/pageLayout';

const sectionSpacing = {
  ...contentWidthSx,
  mt: { xs: 3, sm: 4, md: 6 },
  mb: { xs: 3, sm: 4, md: 6 },
  p: { xs: 2, sm: 3, md: 5 },
};

const Ressources = () => {
    return (
      <div>
        <Box sx={sectionSpacing}>
          <Typography variant="h4" sx={{ mb: 4 }}>Participación</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>Invitamos a todos los interesados, desde estudiantes universitarios hasta miembros de la comunidad de Alta Verapaz, a unirse a este esfuerzo.</Typography>
          <Link target="_blank" href="https://github.com/yeffrimic/water-Quality-Station">Github de dispositivo electrónico</Link>
          <br/>
          <Link target="_blank" href="https://github.com/javiscript13/lakessensor">Github repositorio</Link>
        </Box>
      </div>
    );
}

export default Ressources;
