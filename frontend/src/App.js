import React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Home from './components/Home'

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
      <Home />
    </ThemeProvider>
  );
}

export default App;