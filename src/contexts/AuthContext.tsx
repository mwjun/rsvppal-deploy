// src/contexts/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import { onAuthStateChanged, signOut, User } from "firebase/auth";
  import { auth } from "../firebase";
  
  /* -------- context shape -------- */
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOutUser: () => Promise<void>;
  }
  
  /* -------- default value -------- */
  const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOutUser: async () => {},
  });
  
  /* -------- provider -------- */
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      /* Firebase listener */
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
  
      return unsubscribe; // clean-up
    }, []);
  
    /* helper sign-out */
    const signOutUser = () => signOut(auth);
  
    return (
      <AuthContext.Provider value={{ user, loading, signOutUser }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  /* -------- handy hook -------- */
  export const useAuth = () => useContext(AuthContext);
  