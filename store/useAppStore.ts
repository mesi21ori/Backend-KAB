import { create } from 'zustand';
import { UserRole, mapLegacyRoleToUserRole } from '@/types/roles';

const AHADU_USER_KEY = 'ahadu-user';

// Sync rehydration: read persisted user when store module loads on the client (SSR keeps null).
function getInitialAuth(): { user: User | null; role: UserRole | null } {
  if (typeof window === 'undefined') return { user: null, role: null };
  try {
    const raw = localStorage.getItem(AHADU_USER_KEY);
    if (!raw) return { user: null, role: null };
    const user = JSON.parse(raw) as User;
    if (!user?.id || !user?.role) return { user: null, role: null };
    const role = mapLegacyRoleToUserRole(user.role);
    return { user, role };
  } catch {
    return { user: null, role: null };
  }
}

const initialAuth = getInitialAuth();

// Legacy role type for backward compatibility
export type LegacyRole = 'general_manager' | 'deputy_manager' | 'admin' | 'architect' | 'engineer' | 'head_of_design' | 'head_of_construction';

export interface User {
  id: string;
  name: string;
  email: string;
  role: LegacyRole;
  department?: string;
}

interface AppState {
  // Auth state
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;

  // UI state
  sidebarOpen: boolean; // For mobile sidebar
  sidebarCollapsed: boolean; // For desktop sidebar collapse

  // Actions
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  reset: () => void; // For logout
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state (rehydrated from localStorage on client; null on SSR)
  user: initialAuth.user,
  role: initialAuth.role,
  isAuthenticated: initialAuth.user !== null,
  sidebarOpen: false,
  sidebarCollapsed: false,

  // Actions
  setUser: (user) => {
    const mappedRole = user ? mapLegacyRoleToUserRole(user.role) : null;
    set({
      user,
      role: mappedRole,
      isAuthenticated: user !== null,
    });
    if (typeof window !== 'undefined') {
      if (user !== null) {
        localStorage.setItem(AHADU_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AHADU_USER_KEY);
      }
    }
  },

  setRole: (role) => {
    set({ role, isAuthenticated: role !== null });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  reset: () => {
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      sidebarOpen: false,
      sidebarCollapsed: false,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AHADU_USER_KEY);
    }
  },
}));





