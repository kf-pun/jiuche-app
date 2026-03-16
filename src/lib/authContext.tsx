"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  name: string;
  phone: string;
  company: string;
  avatar: string;       // 姓名首字
  rating: number;
  totalRides: number;
  isDriver: boolean;
  carModel: string;
  carPlate: string;
  carColor: string;
  balance: number;      // NT$
  co2Total: number;     // kg，累計減碳
  joinedAt: string;
}

const DEFAULT_USER: User = {
  name: "王小明",
  phone: "0912-345-678",
  company: "台積電",
  avatar: "王",
  rating: 4.8,
  totalRides: 23,
  isDriver: true,
  carModel: "Toyota Camry",
  carPlate: "ABC-1234",
  carColor: "銀色",
  balance: 1250,
  co2Total: 28.4,
  joinedAt: "2025-09-01",
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string, userData?: Partial<User>) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  deductBalance: (amount: number) => boolean;
  addBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jiuche_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem("jiuche_user", JSON.stringify(u));
    else localStorage.removeItem("jiuche_user");
  };

  const login = (phone: string, userData?: Partial<User>) => {
    const u: User = { ...DEFAULT_USER, phone, ...userData };
    setUser(u);
    persist(u);
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    persist(updated);
  };

  const deductBalance = (amount: number): boolean => {
    if (!user || user.balance < amount) return false;
    const updated = { ...user, balance: user.balance - amount };
    setUser(updated);
    persist(updated);
    return true;
  };

  const addBalance = (amount: number) => {
    if (!user) return;
    const updated = { ...user, balance: user.balance + amount };
    setUser(updated);
    persist(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, updateUser, deductBalance, addBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
