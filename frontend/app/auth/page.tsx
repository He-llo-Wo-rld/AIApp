"use client";

import GoogleLoginButton from "@/components/GoogleLoginButton";
import LoginForm from "@/components/LoginForm";
import PasswordResetConfirmForm from "@/components/PasswordResetConfirmForm";
import PasswordResetRequestForm from "@/components/PasswordResetRequestForm";
import RegisterForm from "@/components/RegisterForm";
import { useState } from "react";

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetRequested, setResetRequested] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">JWT Auth Demo</h1>
      <GoogleLoginButton />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <div className="mb-4">
          <button
            className="text-blue-600 underline"
            onClick={() => setShowReset((v) => !v)}
          >
            Забули пароль?
          </button>
        </div>
        {showReset ? (
          !resetRequested ? (
            <PasswordResetRequestForm
              onSuccess={() => {
                setResetRequested(true);
                setResetEmail(resetEmail);
              }}
            />
          ) : (
            <PasswordResetConfirmForm />
          )
        ) : (
          <>
            {showRegister ? <RegisterForm /> : <LoginForm />}
            <button
              className="mt-4 text-blue-600 underline"
              onClick={() => setShowRegister((v) => !v)}
            >
              {showRegister
                ? "Вже є акаунт? Увійти"
                : "Немає акаунта? Зареєструватися"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
