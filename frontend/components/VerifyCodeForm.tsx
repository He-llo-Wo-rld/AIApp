"use client";
import { useState } from "react";
import api from "../lib/axios";

export default function VerifyCodeForm({
  username,
  onSuccess,
}: {
  username: string;
  onSuccess?: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/verify/", { username, code });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Verification failed");
    }
  };

  if (success)
    return (
      <div className="text-green-600">
        Акаунт підтверджено! Тепер ви можете увійти.
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-4 bg-white rounded shadow flex flex-col gap-4 mt-6"
    >
      <input
        type="text"
        placeholder="Код з email"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="input input-bordered"
        required
      />
      <button type="submit" className="btn btn-primary">
        Підтвердити
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
