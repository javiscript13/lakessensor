import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import { CircularProgress, Grid } from "@mui/material";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <Grid container justifyContent="center" sx={{ paddingTop: 10 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return <LoginPage redirectPath={location.pathname} />;
};

export default PrivateRoute;
