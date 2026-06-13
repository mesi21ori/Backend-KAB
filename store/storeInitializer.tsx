'use client';

import { useEffect } from 'react';
import { useAppStore } from './useAppStore';
import type { LegacyRole } from './useAppStore';

/**
 * Store Initializer Component
 * 
 * Initializes the Zustand store with user data on app load.
 * This should be placed in the root layout to ensure store is initialized before any components use it.
 */
export function StoreInitializer() {
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    // Initialize with demo user (same as UserContext had)
    // In production, this would read from localStorage, session, or auth system
    const user = {
      id: '1',
      name: 'Bisrat S',
      email: 'bisrat.s@ahadu.com',
      role: 'engineer' as LegacyRole,
      department: 'Design',
    };

    // Only set if not already set (to avoid overwriting login)
    const currentUser = useAppStore.getState().user;
    if (!currentUser) {
      setUser(user);
    }
  }, [setUser]);

  return null;
}





