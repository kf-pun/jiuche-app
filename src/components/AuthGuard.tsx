"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem("jiuche_redirect", pathname);
      router.replace("/auth/login");
    }
  }, [isLoggedIn, router, pathname]);

  if (!isLoggedIn) return null;

  return <>{children}</>;
}
