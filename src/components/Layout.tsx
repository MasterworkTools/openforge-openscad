import Box from '@mui/material/Box';
import * as React from 'react';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <Box component="div" sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1, width: '100vw', height: '100vh', p: 0, m: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
