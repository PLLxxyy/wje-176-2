"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  name: string;
  role: "GUEST" | "HOST" | "ADMIN";
  avatar?: string | null;
  phone?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { method: "GET" });
      const json = await res.json();
      setUser(json.data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success) {
      setUser(json.data.user);
      router.refresh();
      return { success: true };
    }
    return { success: false, message: json.message };
  };

  const register = async (data: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setUser(json.data.user);
      router.refresh();
      return { success: true };
    }
    return { success: false, message: json.message };
  };

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    setUser(null);
    router.refresh();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
