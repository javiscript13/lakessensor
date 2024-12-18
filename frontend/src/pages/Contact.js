import React from 'react';
import { Paper, Typography } from '@mui/material';

const mainParagraph = {
  margin: 20,
  marginTop: 5,
  marginBottom: 5,
  padding: 10,
};

const Contact = () => {
    return (
        <div>
        <Paper 
          elevation={3}  
          sx={mainParagraph}
        >
          <Typography variant="h4">Contacto</Typography>
          <Typography variant="body1">Para más información sobre cómo participar o aprender más sobre el proyecto, por favor contacte a la coordinación del proyecto a través de ducuchu@gmail.com</Typography>

        </Paper>

      </div>
    );
}

export default Contact;