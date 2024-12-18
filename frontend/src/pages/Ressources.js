import React from 'react';
import { Paper, Typography, Link } from '@mui/material';

const mainParagraph = {
  margin: 20,
  marginTop: 5,
  marginBottom: 5,
  padding: 10,
};

const Ressources = () => {
    return (
      <div>
        <Paper 
          elevation={3}  
          sx={mainParagraph}
        >
          <Typography variant="h4">Participación</Typography>
          <Typography variant="body1">Invitamos a todos los interesados, desde estudiantes universitarios hasta miembros de la comunidad de Alta Verapaz, a unirse a este esfuerzo.</Typography>
          <Link target="_blank" href="https://github.com/yeffrimic/water-Quality-Station">Github de dispositivo electrónico</Link>
          <br/> 
          <Link target="_blank" href="https://github.com/javiscript13/lakessensor">Github repositorio</Link>
        </Paper>
      </div>
    );
}

export default Ressources;