import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { contentWidthSx } from '../styles/pageLayout';

const sectionSpacing = {
  ...contentWidthSx,
  mt: { xs: 3, sm: 4, md: 6 },
  mb: { xs: 3, sm: 4, md: 6 },
  p: { xs: 2, sm: 3, md: 5 },
};

const Contact = () => {
    return (
        <div>
        <Box sx={sectionSpacing}>
          <Typography variant="h4" sx={{ mb: 4 }}>Contacto</Typography>
          <Typography variant="body1">Para más información sobre cómo participar o aprender más sobre el proyecto, por favor contacte a la coordinación del proyecto a través de <Link href="mailto:ducuchu@gmail.com">ducuchu@gmail.com</Link></Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Para crear tu usuario e ingresar datos escríbenos a <Link href="mailto:ducuchu@gmail.com">ducuchu@gmail.com</Link></Typography>
        </Box>

      </div>
    );
}

export default Contact;
