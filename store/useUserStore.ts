import { create } from "zustand";
import { AppUser } from "@/types";

/**
 * Shape of the Zustand store
 */
interface UserStore {
  currentUser: AppUser | null;
  isLoading: boolean;
  fetchUserInfo: (userDoc: AppUser | null) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isLoading: true,

  fetchUserInfo: async (userDoc) => {
    if (!userDoc || !userDoc.uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    const base = {
      uid: userDoc.uid,
      email: userDoc.email ?? null,
      displayName: userDoc.displayName ?? null,
      photoURL: userDoc.photoURL ?? null,
      emailVerified: userDoc.emailVerified ?? false,
    };

    let currentUser: AppUser;

    switch (userDoc.role) {
      case "admin":
        currentUser = {
          ...base,
          role: "admin",
          property: userDoc.property,
          isVerified: false,
        };
        break;

      case "staff":
        currentUser = {
          ...base,
          role: "staff",
          property: userDoc.property,
          isVerified: false,
        };
        break;

      case "guest":
        currentUser = {
          ...base,
          role: "guest",
          property: null,
          isVerified: true,
        };
        break;

      default:
        throw new Error("Invalid user role");
    }

    set({ currentUser, isLoading: false });
  },
}));
