import { useState, useEffect } from "react";
import { AuthUser } from "./auth-server";

const AUTH_KEY = "drivalong_auth_user";

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));
  } else {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("auth-changed"));
  }
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const logout = () => {
    setStoredUser(null);
  };

  return { user, logout, setStoredUser };
}
