import React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import 'leaflet/dist/leaflet.css'; 
import Menu from './components/Menu';
import AppRoutes from './AppRoutes.js';

const theme = createTheme({
  palette: {
    primary: {
      main: "#2a9461"
    },
    secondary: {
      main: "#942a5d"
    },
    primaryLight: {
      main: "#2a942c",
      contrastText: "#2a9294"
    }
  },
  typography: {
    fontFamily: "'Atkinson Hyperlegible', 'Segoe UI', sans-serif",
    h1: { fontFamily: "'Merriweather', 'Georgia', serif" },
    h2: { fontFamily: "'Merriweather', 'Georgia', serif" },
    h3: { fontFamily: "'Merriweather', 'Georgia', serif" },
    h4: { fontFamily: "'Merriweather', 'Georgia', serif" },
    h5: { fontFamily: "'Merriweather', 'Georgia', serif" },
    h6: { fontFamily: "'Merriweather', 'Georgia', serif" },
    subtitle1: { fontFamily: "'Merriweather', 'Georgia', serif" },
    subtitle2: { fontFamily: "'Merriweather', 'Georgia', serif" },
    body1: { fontSize: '1.1rem' },
    button: { textTransform: 'none' }
  }
});

theme.typography.body1[theme.breakpoints.up('md')] = { fontSize: '1.25rem' };

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Menu />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;