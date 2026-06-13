import { type DashboardType } from './favorites';

export interface DashboardConfig {
  dashboardType: DashboardType;
  basePath: string;
  newLetterPath: string;
  detailPath: (ref: string) => string;
  listPath: string;
}

/**
 * Detects dashboard configuration from pathname
 * Returns appropriate routes and dashboard type based on current path
 */
export function getDashboardConfig(pathname: string): DashboardConfig {
  if (pathname.startsWith('/employee-dashboard/')) {
    return {
      dashboardType: 'employee' as DashboardType,
      basePath: '/employee-dashboard/letters',
      newLetterPath: '/employee-dashboard/letters/new',
      detailPath: (ref: string) => `/employee-dashboard/letters/${encodeURIComponent(ref)}`,
      listPath: '/employee-dashboard/letters',
    };
  }
  
  if (pathname.startsWith('/heads-dashboard/')) {
    return {
      dashboardType: 'heads' as DashboardType,
      basePath: '/heads-dashboard/letters',
      newLetterPath: '/heads-dashboard/letters/new',
      detailPath: (ref: string) => `/heads-dashboard/letters/${encodeURIComponent(ref)}`,
      listPath: '/heads-dashboard/letters',
    };
  }
  
  // Default to GM dashboard
  return {
    dashboardType: 'gms' as DashboardType,
    basePath: '/dashboard/letters',
    newLetterPath: '/dashboard/letters/new',
    detailPath: (ref: string) => `/dashboard/letters/${encodeURIComponent(ref)}`,
    listPath: '/dashboard/letters/letter-list',
  };
}

