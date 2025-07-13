import { create } from "zustand";

interface UserState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
