import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  const location = useLocation();
  

  if (token) {
    return children;
  }
  
  return <LoginPage redirectPath={location.pathname}/>
};

export default PrivateRoute;
