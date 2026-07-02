"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/api/auth";
import { User, LoginCredentials, LoginResponse } from "@/types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  logout: () => void;
  submitAbsen: (tokenCode: string, latitude?: number, longitude?: number) => Promise<{ message: string; status: string }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      let currentUser: User | null = null;
      const cachedUserStr = localStorage.getItem("user");

      if (cachedUserStr) {
        const cachedUser = JSON.parse(cachedUserStr) as User;
        if (cachedUser.role === "guru" || cachedUser.role === "admin") {
          currentUser = cachedUser;
        }
      }

      if (!currentUser) {
        currentUser = await authAPI.getCurrentUser();
      }

      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []);
  const login = useCallback(async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      setIsLoading(true);
      
      const loginData = await authAPI.login(credentials);
      
      let userData: User | null = null;

      if (loginData.role === 'guru' || loginData.role === 'admin' || loginData.role === 'superadmin') {
        userData = {
           id: 0,
           nisn: credentials.nisn,
           fullname: 'Admin/Guru',
           username: 'admin',
           role: loginData.role,
           class_group: '',
           message: loginData.Message || 'success'
        };
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        userData = await authAPI.getCurrentUser();
        if (userData) {
           localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      if (userData) {
        setUser(userData);
        if (userData.role === 'guru' || userData.role === 'admin' || userData.role === 'superadmin') {
          router.push('/admin');
        }
        
      }
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const submitAbsen = useCallback(async (tokenCode: string, latitude?: number, longitude?: number) => {
    return authAPI.submitAbsenToken(tokenCode, latitude, longitude);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      submitAbsen,
    }),
    [user, isLoading, login, logout, submitAbsen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};