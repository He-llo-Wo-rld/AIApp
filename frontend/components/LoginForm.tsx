"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "../lib/axios";
import { useUserStore } from "../store/user";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuthenticated = useUserStore((s) => s.setAuthenticated);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(
        "/login/",
        { username, password },
        { withCredentials: true }
      );
      setAuthenticated(true);
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed");
      setAuthenticated(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-4 bg-white rounded shadow flex flex-col gap-4"
    >
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input input-bordered"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input input-bordered"
        required
      />
      <button type="submit" className="btn btn-primary">
        Login
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
