/**
 * GM KPI & Performance System Type Definitions
 * 
 * Types for General Manager KPI & Performance dashboard
 */

export type ProjectAssignmentStatus = 'active' | 'paused' | 'completed' | 'overdue';
export type ProjectUrgency = 'normal' | 'urgent';
export type PerformanceLabel = 'High Performer' | 'Stable' | 'Needs Attention';

/**
 * Employee basic information
 */
export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

/**
 * Project assignment tracking employee-project relationship
 */
export interface ProjectAssignment {
  id: string;
  employeeId: string;
  projectId: string;
  projectName: string;
  status: ProjectAssignmentStatus;
  urgency: ProjectUrgency;
  startedAt: string; // ISO date string
  pausedAt?: string; // ISO date string (optional)
  completedAt?: string; // ISO date string (optional)
  deadline: string; // ISO date string
  pausedReason?: string; // Reason for pausing (optional)
}

/**
 * KPI calculation result for an employee
 */
export interface KPIResult {
  employeeId: string;
  totalProjects: number;
  completedProjects: number;
  activeDays: number; // Total days spent on active projects
  pausedDays: number; // Total days projects were paused
  overdueCount: number; // Number of overdue projects (only if never paused)
  kpiScore: number; // 0-120
}

/**
 * KPI trend data point for time series chart
 */
export interface KPITrendPoint {
  month: string; // Format: "YYYY-MM"
  score: number; // KPI score for that month
}

/**
 * Priority change log entry
 */
export interface PriorityChangeLog {
  id: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  oldPriority: string;
  newPriority: string;
  changedBy: string; // User who made the change
  reason: string;
  date: string; // ISO date string
}

/**
 * Progress history point for a project
 */
export interface ProgressHistoryPoint {
  date: string; // ISO date string
  progress: number; // 0-100
}

/**
 * Project performance metrics for an employee
 */
export interface ProjectPerformanceMetrics {
  projectId: string;
  employeeId: string;
  projectName: string;
  progress: number; // 0-100
  daysActive: number;
  daysPaused: number;
  startedAt: string; // ISO date string
  deadline: string; // ISO date string
  pausedAt?: string; // ISO date string (optional)
  completedAt?: string; // ISO date string (optional)
  progressHistory: ProgressHistoryPoint[];
  estimatedCompletion?: string; // ISO date string (optional)
}
