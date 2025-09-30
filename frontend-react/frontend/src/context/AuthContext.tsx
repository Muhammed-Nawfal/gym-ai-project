import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children : React.ReactNode}> = ({children}) => {
   const [token, setTokenState] = useState<string | null>(localStorage.getItem("authToken"));

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
        <AuthContext.Provider value={{ token, setToken, logout}}>
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