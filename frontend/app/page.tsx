"use client";

import LogoutButton from "../components/LogoutButton";
import ProfileInfo from "../components/ProfileInfo";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">JWT Auth Demo</h1>
      <ProfileInfo />
      <LogoutButton />
    </main>
  );
}
