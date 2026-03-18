"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRow } from "@/types/database";

export interface User {
  id: string;
  name: string;
  phone: string;
  company: string;
  avatar: string;
  rating: number;
  totalRides: number;
  isDriver: boolean;
  carModel: string;
  carPlate: string;
  carColor: string;
  balance: number;
  co2Total: number;
  joinedAt: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    company: row.company,
    avatar: row.name[0] || "?",
    rating: row.rating,
    totalRides: row.rating_count,
    isDriver: row.is_driver,
    carModel: row.vehicle_type || "",
    carPlate: row.vehicle_plate || "",
    carColor: row.vehicle_color || "",
    balance: row.balance,
    co2Total: Number(row.co2_total),
    joinedAt: row.created_at.slice(0, 10),
  };
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  deductBalance: (amount: number) => boolean;
  addBalance: (amount: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const fetchUser = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    setUser(data ? rowToUser(data as UserRow) : null);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUser(session.user.id);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchUser, supabase]);

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await fetchUser(authUser.id);
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    supabase.from("users").update({
      name: updated.name,
      company: updated.company,
      is_driver: updated.isDriver,
      vehicle_type: updated.carModel || null,
      vehicle_plate: updated.carPlate || null,
      vehicle_color: updated.carColor || null,
    }).eq("id", user.id);
  };

  const deductBalance = (amount: number): boolean => {
    if (!user || user.balance < amount) return false;
    const newBalance = user.balance - amount;
    setUser({ ...user, balance: newBalance });
    supabase.from("users").update({ balance: newBalance }).eq("id", user.id);
    return true;
  };

  const addBalance = (amount: number) => {
    if (!user) return;
    const newBalance = user.balance + amount;
    setUser({ ...user, balance: newBalance });
    supabase.from("users").update({ balance: newBalance }).eq("id", user.id);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, logout, updateUser, deductBalance, addBalance, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
