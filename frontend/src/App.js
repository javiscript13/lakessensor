import React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Menu from './components/Menu';
import AppRoutes from './AppRoutes.js'

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
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Menu />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;