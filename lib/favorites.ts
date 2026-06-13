import type { FavoriteItem, FavoriteType } from '@/types/favorites';
import { UserRole } from '@/types/roles';
import { favoritesApi } from '@/lib/api';

const FRONT_TYPE_TO_API: Record<FavoriteType, string> = {
  'design-project': 'design_project',
  'construction-project': 'construction_project',
  'site-report': 'site_report',
  letter: 'letter',
};

// Legacy DashboardType for backward compatibility
export type DashboardType = 'gms' | 'heads' | 'employee';

/**
 * Maps UserRole to DashboardType for localStorage keys (backward compatibility)
 */
function mapRoleToDashboardType(userRole: UserRole): DashboardType {
  switch (userRole) {
    case 'GENERAL_MANAGER':
      return 'gms';
    case 'HEADS':
      return 'heads';
    case 'EMPLOYEE':
      return 'employee';
  }
}

function getStorageKey(dashboardTypeOrRole: DashboardType | UserRole): string {
  const dashboardType = typeof dashboardTypeOrRole === 'string' && ['gms', 'heads', 'employee'].includes(dashboardTypeOrRole)
    ? dashboardTypeOrRole as DashboardType
    : mapRoleToDashboardType(dashboardTypeOrRole as UserRole);
  return `favorites-${dashboardType}`;
}

export function getFavorites(dashboardTypeOrRole: DashboardType | UserRole): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(getStorageKey(dashboardTypeOrRole));
    if (!stored) return [];
    return JSON.parse(stored) as FavoriteItem[];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

export function addFavorite(
  dashboardTypeOrRole: DashboardType | UserRole,
  item: Omit<FavoriteItem, 'addedAt'>,
  userId?: string
): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const favorites = getFavorites(dashboardTypeOrRole);
    
    // Check if already favorited
    const exists = favorites.some(
      (fav) => fav.type === item.type && fav.id === item.id
    );
    
    if (exists) return false;
    
    const newFavorite: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    
    favorites.push(newFavorite);
    localStorage.setItem(getStorageKey(dashboardTypeOrRole), JSON.stringify(favorites));
    if (userId) {
      const apiType = FRONT_TYPE_TO_API[item.type];
      favoritesApi.add({ userId, type: apiType, refId: item.id, name: item.name, url: item.url }).catch(() => {});
    }
    return true;
  } catch (error) {
    console.error('Error adding favorite to localStorage:', error);
    return false;
  }
}

export function removeFavorite(
  dashboardTypeOrRole: DashboardType | UserRole,
  type: FavoriteType,
  id: string,
  userId?: string
): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const favorites = getFavorites(dashboardTypeOrRole);
    const filtered = favorites.filter(
      (fav) => !(fav.type === type && fav.id === id)
    );
    
    if (filtered.length === favorites.length) return false;
    
    localStorage.setItem(getStorageKey(dashboardTypeOrRole), JSON.stringify(filtered));
    if (userId) {
      const apiType = FRONT_TYPE_TO_API[type];
      favoritesApi.remove(userId, apiType, id).catch(() => {});
    }
    return true;
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
    return false;
  }
}

export function isFavorite(
  dashboardTypeOrRole: DashboardType | UserRole,
  type: FavoriteType,
  id: string
): boolean {
  if (typeof window === 'undefined') return false;
  
  const favorites = getFavorites(dashboardTypeOrRole);
  return favorites.some((fav) => fav.type === type && fav.id === id);
}

export function toggleFavorite(
  dashboardTypeOrRole: DashboardType | UserRole,
  item: Omit<FavoriteItem, 'addedAt'>,
  userId?: string
): boolean {
  const isFav = isFavorite(dashboardTypeOrRole, item.type, item.id);
  
  if (isFav) {
    return removeFavorite(dashboardTypeOrRole, item.type, item.id, userId);
  } else {
    return addFavorite(dashboardTypeOrRole, item, userId);
  }
}

