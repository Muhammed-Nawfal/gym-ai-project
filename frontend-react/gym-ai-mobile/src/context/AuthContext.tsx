import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  setToken: (token: string | null) => Promise<void>;
  logout: () => void;
}

interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  profilePictureUrl?: string;
  height?: number;
  weight?: number;
  goalWeight?: number;
  userGoal?: string;
  skillLevel?: string;
  dob?: string;
  createdAt?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  // True until we've checked AsyncStorage for a saved token. Screens that
  // decide whether to show login vs. the main app should wait for this to
  // become false first, otherwise they'd briefly flash the login screen
  // even when a valid saved token exists.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("authToken")
      .then((storedToken) => {
        if (storedToken) {
          setTokenState(storedToken);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    client
      .get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, [token]);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await AsyncStorage.setItem("authToken", newToken);
    } else {
      await AsyncStorage.removeItem("authToken");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
