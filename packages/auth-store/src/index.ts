import {
  isAuthorized,
  restoreSession as restoreApiSession,
  signIn as apiSignIn,
  signOut as apiSignOut,
} from "@ecommerce-mf/api";
import type { AuthPermission, AuthSession, AuthUser, SignInCredentials } from "@ecommerce-mf/types";
import { create } from "zustand";

export type AuthStatus = "authenticated" | "idle" | "loading" | "unauthenticated";

export type AuthState = {
  can: (permission: AuthPermission) => boolean;
  error?: string;
  initializeSession: () => Promise<void>;
  session: AuthSession | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
};

const getAuthErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Authentication failed. Try again.";

export const useAuthStore = create<AuthState>((set, get) => ({
  can: (permission) => isAuthorized(get().session, permission),
  error: undefined,
  initializeSession: async () => {
    if (get().status === "loading") {
      return;
    }

    set({ error: undefined, status: "loading" });

    try {
      const session = await restoreApiSession();

      set({
        error: undefined,
        session,
        status: session ? "authenticated" : "unauthenticated",
      });
    } catch (error) {
      set({
        error: getAuthErrorMessage(error),
        session: null,
        status: "unauthenticated",
      });
    }
  },
  session: null,
  signIn: async (credentials) => {
    set({ error: undefined, status: "loading" });

    try {
      const session = await apiSignIn(credentials);

      set({
        error: undefined,
        session,
        status: "authenticated",
      });
    } catch (error) {
      set({
        error: getAuthErrorMessage(error),
        session: null,
        status: "unauthenticated",
      });
    }
  },
  signOut: async () => {
    const session = get().session;

    set({ error: undefined, status: "loading" });
    await apiSignOut(session);
    set({ error: undefined, session: null, status: "unauthenticated" });
  },
  status: "idle",
}));

export const selectAuthSession = (state: AuthState) => state.session;

export const selectAuthStatus = (state: AuthState) => state.status;

export const selectAuthUser = (state: AuthState): AuthUser | null => state.session?.user ?? null;

export const selectCanCheckout = (state: AuthState) => state.can("checkout:create");

export const selectCanManageOrders = (state: AuthState) => state.can("orders:manage");

export const selectCanManageProducts = (state: AuthState) => state.can("products:manage");

export const selectIsAuthenticated = (state: AuthState) => state.status === "authenticated";
