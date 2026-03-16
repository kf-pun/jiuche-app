"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return <>{children}</>;
}
