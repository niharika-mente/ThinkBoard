import { createContext, useState, useContext, useEffect, useRef } from "react";
import api from "../lib/axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasChecked = useRef(false);  

  useEffect(() => {
   
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
       
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Auth check failed:", error.response?.status);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);  

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.success) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Register API error:", error);
      return false;
    }
  };

  const login = async (userData) => {
    try {
      const response = await api.post("/auth/login", userData);
      if (response.data.success) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login API error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      return true;
    } catch (error) {
      console.error("Logout API error:", error);
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
