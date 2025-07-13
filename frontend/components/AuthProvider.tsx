"use client";
import { useEffect } from "react";
import api from "../lib/axios";
import { useUserStore } from "../store/user";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuthenticated = useUserStore((s) => s.setAuthenticated);

  useEffect(() => {
    api
      .get("/profile/")
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false));
  }, [setAuthenticated]);

  return <>{children}</>;
}
