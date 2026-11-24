import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Role } from "../models";

const STORAGE_KEY = "uni-lms.role";

interface AuthValue {
  role: Role | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function readStoredRole(): Role | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return Object.values(Role).includes(raw as Role) ? (raw as Role) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(readStoredRole);

  const value = useMemo<AuthValue>(
    () => ({
      role,
      login: (nextRole) => {
        localStorage.setItem(STORAGE_KEY, nextRole);
        setRole(nextRole);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setRole(null);
      },
    }),
    [role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

// Returns a redirect element when the signed-in role cannot open this area.
export function useRequireRole(role: Role): ReactNode {
  const { role: currentRole } = useAuth();
  const location = useLocation();
  if (currentRole === role) return null;
  const next = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?next=${next}`} replace />;
}
