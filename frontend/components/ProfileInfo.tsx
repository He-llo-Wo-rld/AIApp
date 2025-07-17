"use client";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export default function ProfileInfo() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/profile/");
      return res.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 300000,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Not authenticated</div>;

  return (
    <div className="p-4 bg-white rounded shadow max-w-sm mx-auto mt-4">
      <div>
        <b>Username:</b> {data.username}
      </div>
      <div>
        <b>Email:</b> {data.email}
      </div>
      <div>
        <b>ID:</b> {data.id}
      </div>
    </div>
  );
}
