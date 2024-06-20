import React from 'react';
import { Box, Typography } from '@mui/material';

const Section = ({ title, children }) => {
  return (
    <Box className="section">
      <Typography variant="h4" gutterBottom>{title}</Typography>
      {children}
    </Box>
  );
};

export default Section;
