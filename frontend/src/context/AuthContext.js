import { createContext, useContext, useEffect, useState } from "react";
import { logoutUser, getMe } from "../services/apiService";

const AuthContext = createContext();

const tokenIsValid = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [isSuperuser, setIsSuperuser] = useState(false);

    const fetchMe = async () => {
        try {
            const me = await getMe();
            setIsSuperuser(!!me.isSuperuser);
        } catch {
            setIsSuperuser(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token && tokenIsValid(token)) {
            setIsAuthenticated(true);
            fetchMe();
        } else {
            localStorage.removeItem("access");
            setIsAuthenticated(false);
        }
        setAuthLoading(false);
    }, []);

    const login = (access) => {
        localStorage.setItem("access", access);
        setIsAuthenticated(true);
        fetchMe();
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch {
            // cookie cleared on best-effort basis
        }
        localStorage.removeItem("access");
        setIsAuthenticated(false);
        setIsSuperuser(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, authLoading, isSuperuser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
