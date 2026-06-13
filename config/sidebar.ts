/**
 * Sidebar Menu Configuration
 * 
 * Centralized configuration for the unified sidebar component.
 * Each menu item specifies which roles can access it via allowedRoles.
 */

import {
  Bell,
  Building2,
  FolderKanban,
  Mail,
  BookOpen,
  HelpCircle,
  Settings,
  UserPlus,
  MessageSquare,
  PenTool,
  Hammer,
  FileText,
  Trash2,
  List,
  FileEdit,
  Newspaper,
  UserCheck,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { UserRole } from '@/types/roles';

export interface SidebarSubMenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles?: UserRole[]; // If not specified, inherits from parent
  badge?: number; // For dynamic badges (e.g., assigned projects)
  isDynamic?: boolean; // For items that are conditionally added (e.g., Favorites)
}

export interface SidebarMenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
  submenus?: SidebarSubMenuItem[];
  badge?: number; // For dynamic badges (e.g., notifications)
}

/**
 * Base sidebar menu configuration
 * All paths use unified /dashboard/* routes
 */
export const SIDEBAR_MENU_CONFIG: SidebarMenuItem[] = [
  // News & Update - shown separately in sidebar, all roles
  {
    label: 'News & Update',
    path: '/dashboard/news',
    icon: Newspaper,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
  },
  
  // Notifications - all roles
  {
    label: 'Notifications',
    path: '/dashboard/notification',
    icon: Bell,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
  },

  // Company Management - GENERAL_MANAGER only
  {
    label: 'Company Management',
    path: '/dashboard/company-management',
    icon: Building2,
    allowedRoles: ['GENERAL_MANAGER'],
    submenus: [
      {
        label: 'Employee',
        path: '/dashboard/employees',
        icon: UserPlus,
        allowedRoles: ['GENERAL_MANAGER'],
      },
      {
        label: 'Feedback',
        path: '/dashboard/feedback',
        icon: MessageSquare,
        allowedRoles: ['GENERAL_MANAGER'],
      },
    ],
  },

  // KPI & Performance - GENERAL_MANAGER only (expandable with Overview, By Employee)
  {
    label: 'KPI & Performance',
    path: '/dashboard/company-management/kpi',
    icon: TrendingUp,
    allowedRoles: ['GENERAL_MANAGER'],
    submenus: [
      {
        label: 'Overview',
        path: '/dashboard/company-management/kpi',
        icon: TrendingUp,
        allowedRoles: ['GENERAL_MANAGER'],
      },
      {
        label: 'By Employee',
        path: '/dashboard/company-management/kpi/employees',
        icon: Users,
        allowedRoles: ['GENERAL_MANAGER'],
      },
    ],
  },

  // Feedback - HEAD and EMPLOYEE (GENERAL_MANAGER has it under Company Management)
  {
    label: 'Feedback',
    path: '/dashboard/feedback',
    icon: MessageSquare,
    allowedRoles: ['HEADS', 'EMPLOYEE'],
  },

  // My Performance & Projects - EMPLOYEE only
  {
    label: 'My Performance & Projects',
    path: '/employee-dashboard/kpi',
    icon: TrendingUp,
    allowedRoles: ['EMPLOYEE'],
  },

  // Project Management - all roles (different submenus per role)
  {
    label: 'Project Management',
    path: '/dashboard/projects',
    icon: FolderKanban,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
    submenus: [
      // My Assigned Projects - HEAD and EMPLOYEE only
      {
        label: 'My Assigned Projects',
        path: '/dashboard/projects/assigned',
        icon: UserCheck,
        allowedRoles: ['HEADS', 'EMPLOYEE'],
        isDynamic: false, // Always shown for HEAD and EMPLOYEE
      },
      // Design Project - all roles
      {
        label: 'Design Project',
        path: '/dashboard/projects/design',
        icon: PenTool,
        allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
      },
      // Construction Project - all roles
      {
        label: 'Construction Project',
        path: '/dashboard/projects/construction',
        icon: Hammer,
        allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
      },
      // Site Report - all roles
      {
        label: 'Site Report',
        path: '/dashboard/site-report',
        icon: FileText,
        allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
      },
      // Deleted Items - all roles
      {
        label: 'Deleted Items',
        path: '/dashboard/projects/deleted',
        icon: Trash2,
        allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
      },
      // Favorites - dynamically added if user has favorites
      {
        label: 'Favorites',
        path: '/dashboard/favorites',
        icon: Star,
        allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
        isDynamic: true, // Conditionally shown based on favorites
      },
    ],
  },

  // Letters - all roles (EMPLOYEE/HEADS: single link to list; GM: list + template submenus)
  {
    label: 'Letters',
    path: '/dashboard/letters/letter-list',
    icon: Mail,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
    submenus: [
      // Letter List - GENERAL_MANAGER only (employee/heads go directly to Letters)
      {
        label: 'Letter List',
        path: '/dashboard/letters/letter-list',
        icon: List,
        allowedRoles: ['GENERAL_MANAGER'],
      },
      // Letter Template - GENERAL_MANAGER only
      {
        label: 'Letter Template',
        path: '/dashboard/letters/letter-template',
        icon: FileEdit,
        allowedRoles: ['GENERAL_MANAGER'],
      },
    ],
  },

  // Onboarding - all roles
  {
    label: 'Onboarding',
    path: '/dashboard/sop',
    icon: BookOpen,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
  },

  // Support - all roles
  {
    label: 'Support',
    path: '#',
    icon: HelpCircle,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
  },

  // Settings - all roles
  {
    label: 'Settings',
    path: '/dashboard/settings',
    icon: Settings,
    allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
    submenus: [
      {
        label: 'Account & Security',
        path: '/account/change-password',
        icon: Settings,
        allowedRoles: ['GENERAL_MANAGER', 'HEADS', 'EMPLOYEE'],
      },
    ],
  },
];

/**
 * Filters menu items based on user role
 */
export function filterMenuItemsByRole(
  menuItems: SidebarMenuItem[],
  userRole: UserRole
): SidebarMenuItem[] {
  return menuItems
    .filter((item) => item.allowedRoles.includes(userRole))
    .map((item) => {
      // Filter submenus if they exist
      if (item.submenus) {
        const filteredSubmenus = item.submenus.filter((submenu) => {
          // If submenu has specific allowedRoles, check them
          // Otherwise, inherit from parent (which we already filtered)
          if (submenu.allowedRoles) {
            return submenu.allowedRoles.includes(userRole);
          }
          return true; // Inherit from parent
        });

        return {
          ...item,
          submenus: filteredSubmenus.length > 0 ? filteredSubmenus : undefined,
        };
      }
      return item;
    });
}




