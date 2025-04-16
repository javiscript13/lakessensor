import React, { startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { useAuth } from '../context/AuthContext'
import LogoutIcon from "@mui/icons-material/Logout";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout()
    startTransition(() => {
        navigate("/"); 
    });
  };

  return (
    <IconButton color="inherit" onClick={handleLogout} title="Cerrar sesión">
      <LogoutIcon />
    </IconButton>
  );
};

export default LogoutButton;