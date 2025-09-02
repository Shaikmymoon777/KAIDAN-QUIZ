import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email?: string;
  username?: string;
  // Add other user properties as needed
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true, // Start with loading true
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load user from localStorage', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const contextValue = {
    user,
    setUser,
    loading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}