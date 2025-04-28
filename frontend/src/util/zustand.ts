import { create } from "zustand";

// TODO: Use User type from backend
interface UserState {
  user: string | null;
  setUser: (user: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));