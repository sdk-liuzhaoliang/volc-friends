"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@/types/user";

type UserContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  loadingUser: boolean;
  setLoadingUser: (b: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoadingUser(false);
      return;
    }
    fetch("/api/user/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async res => {
      if (res.status === 200) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser, setLoadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}; 