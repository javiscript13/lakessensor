import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (isAuthenticated) {
    return children;
  }

  return <LoginPage redirectPath={location.pathname} />;
};

export default PrivateRoute;
