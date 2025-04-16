
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
CircularProgress,
} from "@mui/material";
import { loginUser } from '../services/apiService';

const LoginPage = ({ redirectPath = "/"}) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { access, refresh } = await loginUser(email, password);
            login(access, refresh)
            navigate(redirectPath, { replace: true });
        } catch (err) {
            console.error(err);
            setError(
            err.response?.data?.detail ||
            "Error al iniciar sesión. Verifica tus credenciales."
            );
        } finally {
            setLoading(false);
        }
    };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h4" mb={4}>
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Entrar"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}


export default LoginPage;