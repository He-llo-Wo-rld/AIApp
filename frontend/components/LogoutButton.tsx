"use client";
import api from "../lib/axios";
import { useUserStore } from "../store/user";

export default function LogoutButton() {
  const setAuthenticated = useUserStore((s) => s.setAuthenticated);

  const handleLogout = async () => {
    await api.post("/logout/");
    setAuthenticated(false);
  };

  return (
    <button onClick={handleLogout} className="btn btn-secondary mt-4">
      Logout
    </button>
  );
}
