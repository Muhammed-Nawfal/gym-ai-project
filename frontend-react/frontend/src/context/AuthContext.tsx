import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    token: string | null;
    user: AuthUser | null;
    setToken: (token: string | null) => void;
    logout: () => void;
}

interface AuthUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    profilePictureUrl?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children : React.ReactNode}> = ({children}) => {
   const [token, setTokenState] = useState<string | null>(localStorage.getItem("authToken"));

   const [ user, setUser] = useState<AuthUser | null>(null);

   useEffect(() => {
    if (!token) {
        setUser(null);
        return;
    }

    axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
        setUser(res.data);
    })
    .catch(() => {
        setUser(null);
    });
   }, [token]);

    const setToken = (newToken: string | null) => {
    if (newToken) {
        localStorage.setItem("authToken", newToken);
    } else {
        localStorage.removeItem("authToken");
    }
    setTokenState(newToken);
    };


    const logout = () => {
        setToken(null);
    }

    return(
        <AuthContext.Provider value={{ token, user, setToken, logout}}>
            {children}
        </AuthContext.Provider>
    );
        
    
};

export const useAuth = () : AuthContextType => {
    const ctx = useContext(AuthContext);
        if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}