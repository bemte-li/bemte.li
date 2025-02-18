"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getClientSideInstance } from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

interface User extends RecordModel {
  email: string;
  name?: string;
  // Add other user fields as needed
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  createAccount: (userData: Partial<User> & { password: string }) => Promise<User>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const pb = getClientSideInstance();

    // Try to refresh auth on mount
    const refreshAuth = async () => {
      try {
        if (pb.authStore.isValid) {
          await pb.collection("usuarios").authRefresh();
          setUser(pb.authStore.model as User);
        }
      } catch (err) {
        console.error("Auth refresh failed:", err);
        pb.authStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    pb.authStore.onChange((token, model) => {
      setUser(model ? (model as User) : null);
    });

    refreshAuth();

    // No need to cleanup onChange as it's handled by PocketBase internally
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const pb = getClientSideInstance();
      const authData = await pb.collection("usuarios").authWithPassword(email, password);
      setUser(authData.record as User);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    const pb = getClientSideInstance();
    pb.authStore.clear();
    setUser(null);
  };

  const createAccount = async (userData: Partial<User> & { password: string }): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const pb = getClientSideInstance();
      const record = await pb.collection("usuarios").create(userData);
      // Automatically sign in after account creation
      await signIn(userData.email!, userData.password);
      return record as User;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        createAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}