import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AddEmployeeInput,
  AuthUser,
  LoginResult,
  UpdatePasswordResult,
  LoginFailureReason,
} from '@/types/auth';
import type { UserRole } from '@/types/roles';
import {
  generateTempPassword,
  getTempExpiry,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthState {
  currentUser: AuthUser | null;
  employees: AuthUser[];

  addEmployee: (input: AddEmployeeInput) => { user: AuthUser; tempPassword: string };
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  updatePassword: (
    userId: string,
    currentPassword: string | null,
    newPassword: string,
  ) => Promise<UpdatePasswordResult>;
}

// ✅ Map API → strict LoginFailureReason
function toLoginReason(reason?: string): LoginFailureReason {
  switch (reason) {
    case 'wrong_password':
    case 'not_found':
    case 'temp_expired':
      return reason;
    default:
      return 'wrong_password';
  }
}

function toUserRoleFromEmployeeRole(role: AddEmployeeInput['role']): UserRole {
  if (role === 'HEAD') return 'HEADS';
  return 'EMPLOYEE';
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      employees: [],

      addEmployee: (input) => {
        const tempPassword = generateTempPassword();
        const userRole: UserRole = toUserRoleFromEmployeeRole(input.role);

        const newUser: AuthUser = {
          id: createId(),
  companyId: input.companyId,
  fullName: input.fullName,
  email: input.email,
  role: userRole,
  department: input.department,
  passwordHash: null,
  tempPasswordHash: hashPassword(tempPassword),
  tempPasswordExpiresAt: getTempExpiry(),
  mustChangePassword: true,
        };

        set((state) => ({
          employees: [...state.employees, newUser],
        }));

        return { user: newUser, tempPassword };
      },

      // ✅ LOGIN
      login: async (email, password) => {
        try {
          const res = await authApi.login(email.trim(), password);

         if (res.success && 'user' in res && res.user) {
  const apiUser = res.user as Partial<AuthUser>;

  // 🔥 FORCE companyId to exist
  const user: AuthUser = {
    id: apiUser.id!,
    companyId: apiUser.companyId ?? '', // 👈 CRITICAL FIX
    fullName: apiUser.fullName!,
    email: apiUser.email!,
    role: apiUser.role!,
    department: apiUser.department ?? null,
    passwordHash: null,
    tempPasswordHash: null,
    tempPasswordExpiresAt: null,
    mustChangePassword: false,
  };

  console.log('LOGIN USER:', user); // 👈 DEBUG

  if (!user.companyId) {
    console.error('❌ companyId missing from API response');
  }

  set({ currentUser: user });

  return { success: true, user };
}
          return {
            success: false,
            reason: toLoginReason((res as { reason?: string }).reason),
          };
        } catch {
          // fallback to local users
        }

        const state = get();
        const user = state.employees.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );

        if (!user) {
          return { success: false, reason: 'not_found' };
        }

        if (user.passwordHash) {
          const valid = verifyPassword(password, user.passwordHash);
          if (!valid) {
            return { success: false, reason: 'wrong_password' };
          }

          const updatedUser: AuthUser = {
            ...user,
            mustChangePassword: user.mustChangePassword ?? false,
          };

          set({
            currentUser: updatedUser,
            employees: state.employees.map((u) =>
              u.id === user.id ? updatedUser : u,
            ),
          });

          return { success: true, user: updatedUser };
        }

        if (user.tempPasswordHash) {
          if (
            user.tempPasswordExpiresAt &&
            Date.now() > Date.parse(user.tempPasswordExpiresAt)
          ) {
            return { success: false, reason: 'temp_expired' };
          }

          const valid = verifyPassword(password, user.tempPasswordHash);
          if (!valid) {
            return { success: false, reason: 'wrong_password' };
          }

          const updatedUser: AuthUser = {
            ...user,
            mustChangePassword: true,
          };

          set({
            currentUser: updatedUser,
            employees: state.employees.map((u) =>
              u.id === user.id ? updatedUser : u,
            ),
          });

          return { success: true, user: updatedUser };
        }

        return { success: false, reason: 'wrong_password' };
      },

      logout: () => {
        set({ currentUser: null });
      },

      // ✅ UPDATE PASSWORD (FINAL FIX)
      updatePassword: async (userId, currentPassword, newPassword) => {
        try {
          const res = await authApi.changePassword(
            userId,
            currentPassword ?? '',
            newPassword,
          );

          if (res.success && 'user' in res && res.user) {
            const user = res.user as AuthUser;

            set((state) => ({
              currentUser:
                state.currentUser?.id === userId ? user : state.currentUser,
              employees: state.employees.map((u) =>
                u.id === userId ? user : u,
              ),
            }));

            return { success: true, user };
          }

          return {
            success: false,
            reason:
              (res as { reason?: string }).reason === 'wrong_current'
                ? 'wrong_current'
                : 'wrong_current',
          };
        } catch {
          return { success: false, reason: 'wrong_current' };
        }
      },
    }),
    { name: 'ahadu-auth' },
  ),
);