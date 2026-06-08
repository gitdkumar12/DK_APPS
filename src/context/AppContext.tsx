// ── Context: Global Auth + DB state ──────────────────────────
'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { LocalDbService } from '@/services/LocalDbService';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAdmin: boolean;
  logout: () => void;
  refreshKey: number;
  refresh: () => void;
  mounted: boolean;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isAdmin: false,
  logout: () => {},
  refreshKey: 0,
  refresh: () => {},
  mounted: false,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // `mounted` starts false on both server AND client.
  // Only flips to true after the first client-side effect, which means the
  // app shell never mismatches between SSR and hydration.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    LocalDbService.init();
    const saved = LocalDbService.getCurrentUser();
    if (saved) setCurrentUserState(saved);
    setMounted(true);
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    if (user) LocalDbService.setCurrentUser(user);
    else LocalDbService.logout();
  }, []);

  const logout = useCallback(() => {
    LocalDbService.logout();
    setCurrentUserState(null);
  }, []);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAdmin: currentUser?.role === 'ADMIN',
      logout,
      refreshKey,
      refresh,
      mounted,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
