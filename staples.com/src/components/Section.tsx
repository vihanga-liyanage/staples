import { FunctionComponent, ReactElement } from 'react';
import { Box, Typography } from '@mui/material';

interface SectionProps {
 title: string;
 children: any;
}

const Section: FunctionComponent<SectionProps> = ({ title, children }): ReactElement => {
  return (
    <Box className="section">
      <Typography variant="h4" gutterBottom>{title}</Typography>
      {children}
    </Box>
  );
};

export default Section;
