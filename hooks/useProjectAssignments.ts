'use client';

import { useState, useCallback, useEffect } from 'react';
import { projectAssignmentsApi, type ProjectAssignmentApi } from '@/lib/api';

export interface ProjectAssignmentRecord {
  id: string;
  employeeId: string;
  projectId: string;
  projectName?: string;
  status: string;
  urgency: string;
  startedAt: string;
  deadline: string;
  pausedAt?: string | null;
  completedAt?: string | null;
  pausedReason?: string | null;
  progressHistory?: Array<{ date: string; progress: number }>;
  employee?: { id: string; fullName: string };
  project?: { id: string; projectName: string };
}

function mapApiToAssignment(a: ProjectAssignmentApi): ProjectAssignmentRecord {
  return {
    id: a.id,
    employeeId: a.employeeId,
    projectId: a.projectId,
    projectName: a.projectName ?? a.project?.projectName,
    status: a.status,
    urgency: a.urgency,
    startedAt: a.startedAt,
    deadline: a.deadline,
    pausedAt: a.pausedAt ?? undefined,
    completedAt: a.completedAt ?? undefined,
    pausedReason: a.pausedReason ?? undefined,
    progressHistory: a.progressHistory,
    employee: a.employee,
    project: a.project,
  };
}

export function useProjectAssignments(params?: { employeeId?: string; projectId?: string; status?: string }) {
  const [assignments, setAssignments] = useState<ProjectAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await projectAssignmentsApi.list(params);
      setAssignments(Array.isArray(list) ? list.map(mapApiToAssignment) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [params?.employeeId, params?.projectId, params?.status]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const updateAssignment = useCallback(async (id: string, body: Record<string, unknown>) => {
    try {
      const a = await projectAssignmentsApi.update(id, body);
      setAssignments((prev) => prev.map((x) => (x.id === id ? mapApiToAssignment(a) : x)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const addProgress = useCallback(async (id: string, date: string, progress: number) => {
    try {
      await projectAssignmentsApi.addProgress(id, date, progress);
      await fetchAssignments();
      return true;
    } catch {
      return false;
    }
  }, [fetchAssignments]);

  return { assignments, loading, error, refetch: fetchAssignments, updateAssignment, addProgress };
}
