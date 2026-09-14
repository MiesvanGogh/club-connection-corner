import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getToken, setToken } from "./api";
import type { TeamRole } from "./types";

interface Claims {
  userId: string | null;
  email: string | null;
  name: string | null;
  roles: string[];
}

function decode(token: string | null): Claims {
  const empty: Claims = { userId: null, email: null, name: null, roles: [] };
  if (!token) return empty;
  try {
    const part = token.split(".")[1];
    if (!part) return empty;
    const json = JSON.parse(
      decodeURIComponent(
        atob(part.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
    const roleClaim =
      json.role ??
      json.roles ??
      json["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
    return {
      userId:
        json.sub ??
        json.nameid ??
        json["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
        null,
      email:
        json.email ??
        json["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
        null,
      name:
        json.name ??
        json.given_name ??
        json["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
        null,
      roles,
    };
  } catch {
    return empty;
  }
}

interface AuthValue extends Claims {
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  canManage: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTokenState(getToken());
    setReady(true);
  }, []);

  const signIn = useCallback((next: string) => {
    setToken(next);
    setTokenState(next);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setTokenState(null);
  }, []);

  const value = useMemo<AuthValue>(() => {
    const claims = decode(token);
    const isAdmin = claims.roles.some((r) => /admin/i.test(r));
    const isTrainer = claims.roles.some((r) => /trainer|coach/i.test(r));
    return {
      ...claims,
      token,
      ready,
      isAuthenticated: Boolean(token),
      isAdmin,
      isTrainer,
      canManage: isAdmin || isTrainer,
      signIn,
      signOut,
    };
  }, [token, ready, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth moet binnen AuthProvider gebruikt worden");
  return ctx;
}

export type { TeamRole };
