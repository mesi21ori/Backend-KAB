/**
 * User Role Types
 * 
 * Standardized role system for the dashboard.
 * All user roles must map to one of these three roles.
 */

export type UserRole = 'GENERAL_MANAGER' | 'HEADS' | 'EMPLOYEE';

/**
 * Legacy role types from the old system
 */
export type LegacyRole = 'general_manager' | 'deputy_manager' | 'admin' | 'architect' | 'engineer' | 'head_of_design' | 'head_of_construction';

/**
 * Maps legacy roles to the new standardized role system
 * 
 * @param legacyRole - The old role string from UserContext
 * @returns The standardized UserRole
 */
export function mapLegacyRoleToUserRole(legacyRole: string | undefined): UserRole {
  if (!legacyRole) {
    return 'EMPLOYEE'; // Default fallback
  }

  const normalizedRole = legacyRole.toLowerCase().trim();

  // GENERAL_MANAGER group: general_manager, deputy_manager, admin
  if (
    normalizedRole === 'general_manager' || 
    normalizedRole === 'deputy_manager' || 
    normalizedRole === 'admin' ||
    normalizedRole.includes('general') || 
    normalizedRole.includes('manager') ||
    normalizedRole.includes('deputy') ||
    normalizedRole.includes('admin')
  ) {
    return 'GENERAL_MANAGER';
  }

  // HEADS group: head_of_design, head_of_construction only
  if (
    normalizedRole === 'head_of_design' ||
    normalizedRole === 'head_of_construction'
  ) {
    return 'HEADS';
  }

  // Employee mapping - default for any other roles
  return 'EMPLOYEE';
}

/**
 * Gets the display name for a user role
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'GENERAL_MANAGER':
      return 'General Manager';
    case 'HEADS':
      return 'Heads';
    case 'EMPLOYEE':
      return 'Employee';
    default:
      return 'Employee';
  }
}

/**
 * Get specific head department from legacy role
 */
export function getHeadDepartment(legacyRole: string | undefined): 'design' | 'construction' | null {
  if (!legacyRole) return null;
  
  const normalizedRole = legacyRole.toLowerCase().trim();
  
  if (normalizedRole === 'head_of_design') return 'design';
  if (normalizedRole === 'head_of_construction') return 'construction';
  
  return null;
}

/**
 * Check if user can create specific project type based on their role
 */
export function canCreateProjectType(legacyRole: string | undefined, projectType: 'design' | 'construction'): boolean {
  const department = getHeadDepartment(legacyRole);
  return department === projectType;
}

/**
 * Checks if a role has access to a specific feature/page
 */
export function hasRoleAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Employee dashboard: architect can submit and be assigned to design projects only (can see all).
 */
export function isEmployeeArchitect(legacyRole: string | undefined, department?: string): boolean {
  if (!legacyRole) return false;
  const r = legacyRole.toLowerCase().trim();
  const d = (department || '').toLowerCase();
  return r.includes('architect') || r.includes('design') || d.includes('design') || d.includes('architect');
}

/**
 * Employee dashboard: engineer can submit and be assigned to construction projects only (can see all).
 */
export function isEmployeeEngineer(legacyRole: string | undefined, department?: string): boolean {
  if (!legacyRole) return false;
  const r = legacyRole.toLowerCase().trim();
  const d = (department || '').toLowerCase();
  return r.includes('engineer') || r.includes('construction') || d.includes('engineer') || d.includes('construction');
}
