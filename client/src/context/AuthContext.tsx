
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  type AuthUser,
} from "../services/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const TOKEN_KEY = "cineverse-token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  // Check whether a saved token is still valid
  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      active = false;
    };
  }, [token]);

  // Login
  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);

    localStorage.setItem(TOKEN_KEY, data.token);

    setUser(data.user);
    setToken(data.token);
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const data = await registerUser(name, email, password);

    localStorage.setItem(TOKEN_KEY, data.token);

    setUser(data.user);
    setToken(data.token);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
