'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  constructionProjectsApi,
  type ConstructionProjectApi,
} from '@/lib/api';
import type { ConstructionProject } from '@/app/dashboard/projects/construction/data/projects';

// ✅ Normalize API → UI status
const normalizeReportStatus = (
  status: string
): 'Approved' | 'Rejected' | 'Pending Approval' => {
  if (status === 'Approved' || status === 'Rejected' || status === 'Pending Approval') {
    return status;
  }
  return 'Pending Approval';
};

function mapApiToProject(p: ConstructionProjectApi): ConstructionProject {
  const milestones = p.milestones ?? [];

  const totalWeight = milestones.reduce((s, m) => s + m.weight, 0) || 1;

  const progress = Math.round(
    (milestones.reduce((s, m) => s + (m.completed ? m.weight : 0), 0) /
      totalWeight) *
      100
  );

  // ✅ Safely extract API report
  const apiReport = (p as {
    lastSiteReport?: { date: string; status: string };
  }).lastSiteReport;

  return {
    id: p.id,
    code: p.code,
    projectName: p.projectName,

    siteLocation: (p as { siteLocation?: string }).siteLocation ?? '',

    residentEngineer:
      (p as { residentEngineer?: string }).residentEngineer ??
      (p.createdBy as { fullName?: string })?.fullName ??
      '—',

    department: (p as { department?: string }).department ?? 'Construction',

    progress,

    // ✅ FIXED (typed safely)
    lastSiteReport: {
      date: apiReport?.date ?? '',
      status: normalizeReportStatus(apiReport?.status ?? 'Pending Approval'),
    },

    materialIssues: (p as { materialIssues?: string }).materialIssues ?? 'None',

    status: (p.status as 'Active' | 'Pending' | 'Completed') ?? 'Active',

    startDate: (p as { startDate?: string }).startDate ?? '',
    estimatedCompletion:
      (p as { estimatedCompletion?: string }).estimatedCompletion ?? '',

    reportsCount: (p as { reportsCount?: number }).reportsCount ?? 0,

    lastUpdated: p.updatedAt ?? '',

    milestones: milestones.map((m) => ({
      name: m.name,
      targetDate: m.targetDate,
      weight: m.weight,
      completed: m.completed,
    })),

    description: p.description,
  };
}

export function useConstructionProjects(params?: { status?: string }) {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await constructionProjectsApi.list(params);
      setProjects(Array.isArray(list) ? list.map(mapApiToProject) : []);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to load construction projects'
      );
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [params?.status]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const updateProject = useCallback(
    async (id: string, updates: Partial<ConstructionProject>) => {
      try {
        const updated = await constructionProjectsApi.update(
          id,
          updates as Record<string, unknown>
        );

        setProjects((prev) =>
          prev.map((p) => (p.id === id ? mapApiToProject(updated) : p))
        );

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const deleteProject = useCallback(async (id: string) => {
    try {
      await constructionProjectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    updateProject,
    deleteProject,
  };
}