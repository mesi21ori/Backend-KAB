import type { UserRole } from './roles';

/**
 * Core authenticated user shape for the frontend auth flow.
 * Password-related fields always store hashes, never plain text.
 */
export interface AuthUser {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string | null;
  passwordHash?: string | null;
  tempPasswordHash?: string | null;
  tempPasswordExpiresAt?: string | null;
  mustChangePassword: boolean;
}
export type LoginFailureReason = 'not_found' | 'wrong_password' | 'temp_expired';

export type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; reason: LoginFailureReason };

export type UpdatePasswordFailureReason = 'wrong_current' | 'no_user' | 'request_failed';

export type UpdatePasswordResult =
  | { success: true; user: AuthUser }
  | { success: false; reason: UpdatePasswordFailureReason };

/**
 * Input data when GM adds a new employee/head via the UI.
 * Role here is limited to non-GM accounts; GM is managed separately.
 */

export interface AddEmployeeInput {
  companyId: string;
  fullName: string;
  email: string;
  role: 'HEAD' | 'EMPLOYEE';
  department?: string;
}
