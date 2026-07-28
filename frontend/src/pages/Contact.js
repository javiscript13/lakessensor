import React from 'react';
import { Paper, Typography } from '@mui/material';
import { contentWidthSx } from '../styles/pageLayout';

const mainParagraph = {
  ...contentWidthSx,
  my: { xs: 1, sm: 2, md: 3 },
  p: { xs: 2, sm: 3, md: 5 },
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