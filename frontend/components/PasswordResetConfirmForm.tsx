import { useState } from "react";
import api from "../lib/axios";

export default function PasswordResetConfirmForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/password-reset-confirm/", {
        email,
        code,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-green-600">
        Пароль успішно змінено! Можете увійти.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="input"
      />
      <input
        type="text"
        placeholder="Код з email"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        className="input"
      />
      <input
        type="password"
        placeholder="Новий пароль"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="input"
      />
      <button type="submit" className="btn" disabled={loading}>
        Змінити пароль
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
