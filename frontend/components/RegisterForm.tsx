"use client";
import { useState } from "react";
import api from "../lib/axios";
import { useUserStore } from "../store/user";
import VerifyCodeForm from "./VerifyCodeForm";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const setAuthenticated = useUserStore((s) => s.setAuthenticated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/register/", { username, password, email });
      setVerificationCode(res.data.verification_code || "");
      setShowVerify(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
      setAuthenticated(false);
    }
  };

  return (
    <>
      {showVerify ? (
        <div className="max-w-sm mx-auto p-4 bg-white rounded shadow flex flex-col gap-4 mt-6">
          <div className="mb-2">
            Ми надіслали код на email (або показали тут для тесту):{" "}
            <b>{verificationCode}</b>
          </div>
          <VerifyCodeForm
            username={username}
            onSuccess={() => setShowVerify(false)}
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-sm mx-auto p-4 bg-white rounded shadow flex flex-col gap-4 mt-6"
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Register
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      )}
    </>
  );
}
