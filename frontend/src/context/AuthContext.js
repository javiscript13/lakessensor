import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access"));

    const login = (access, refresh) => {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);