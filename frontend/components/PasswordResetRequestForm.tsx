import { useState } from "react";
import api from "../lib/axios";

export default function PasswordResetRequestForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/password-reset-request/", { email });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error");
    } finally {
      setLoading(false);
    }
  };

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
      <button type="submit" className="btn" disabled={loading}>
        Надіслати код
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
