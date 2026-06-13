import { UserRole } from '@/types/roles';

// Legacy DashboardType for backward compatibility
export type DashboardType = 'employee' | 'heads';

/**
 * Maps UserRole to DashboardType for localStorage keys (backward compatibility)
 */
function mapRoleToDashboardType(userRole: UserRole): DashboardType {
  switch (userRole) {
    case 'GENERAL_MANAGER':
      return 'heads'; // Not used for GM, but needed for type
    case 'HEADS':
      return 'heads';
    case 'EMPLOYEE':
      return 'employee';
  }
}

/**
 * Get the storage key for viewed assigned projects
 */
function getStorageKey(dashboardTypeOrRole: DashboardType | UserRole, userId: string): string {
  const dashboardType = typeof dashboardTypeOrRole === 'string' && ['employee', 'heads'].includes(dashboardTypeOrRole)
    ? dashboardTypeOrRole as DashboardType
    : mapRoleToDashboardType(dashboardTypeOrRole as UserRole);
  return `viewed-assigned-projects-${dashboardType}-${userId}`;
}

/**
 * Get list of viewed assigned project codes for a user
 */
export function getViewedAssignedProjects(
  dashboardTypeOrRole: DashboardType | UserRole,
  userId: string
): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = getStorageKey(dashboardTypeOrRole, userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch (error) {
    console.error('Error reading viewed assigned projects from localStorage:', error);
    return [];
  }
}

/**
 * Mark an assigned project as viewed
 */
export function markAssignedProjectAsViewed(
  dashboardTypeOrRole: DashboardType | UserRole,
  userId: string,
  projectCode: string
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(dashboardTypeOrRole, userId);
    const viewed = getViewedAssignedProjects(dashboardTypeOrRole, userId);
    
    if (!viewed.includes(projectCode)) {
      viewed.push(projectCode);
      localStorage.setItem(key, JSON.stringify(viewed));
    }
  } catch (error) {
    console.error('Error marking assigned project as viewed:', error);
  }
}

/**
 * Mark multiple assigned projects as viewed
 */
export function markAssignedProjectsAsViewed(
  dashboardTypeOrRole: DashboardType | UserRole,
  userId: string,
  projectCodes: string[]
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(dashboardTypeOrRole, userId);
    const viewed = getViewedAssignedProjects(dashboardTypeOrRole, userId);
    const newProjects = projectCodes.filter(code => !viewed.includes(code));
    
    if (newProjects.length > 0) {
      const updated = [...viewed, ...newProjects];
      localStorage.setItem(key, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error marking assigned projects as viewed:', error);
  }
}

/**
 * Get count of unviewed assigned projects
 * This function will be called from the sidebar components with project data
 */
export function getUnviewedAssignedProjectsCount(
  dashboardTypeOrRole: DashboardType | UserRole,
  userId: string,
  assignedProjectCodes: string[]
): number {
  if (typeof window === 'undefined') return 0;
  
  const viewed = getViewedAssignedProjects(dashboardTypeOrRole, userId);
  const unviewed = assignedProjectCodes.filter(code => !viewed.includes(code));
  return unviewed.length;
}

