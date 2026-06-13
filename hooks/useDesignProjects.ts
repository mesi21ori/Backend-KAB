'use client';

import { useState, useCallback, useEffect } from 'react';
import { designProjectsApi, type DesignProjectApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { DesignProject } from '@/app/dashboard/projects/design/data/projects';

function mapApiToProject(p: DesignProjectApi): DesignProject & { id: string } {
  return {
    id: p.id,
    code: p.code,
    projectName: p.projectName,
    department: p.department,
    leadArchitect: p.leadArchitect,
    location: p.location ?? undefined,
    designStage: p.designStage,
    designType: p.designType,
    approvalStatus: p.approvalStatus,
    status: (p.status as 'active' | 'completed' | 'pending') ?? 'active',
    startDate: p.startDate,
    endDate: p.endDate,
    submissionDate: p.submissionDate,
    submittedBy: p.submittedBy,
    revisionNumber: p.revisionNumber,
    description: p.description ?? '',
    attachments: (p.attachments ?? []).map((a) => ({
      name: a.name,
      type: a.type,
      url: a.url ?? undefined,
    })),
    lastReportedDate: p.lastReportedDate,
    priority: (p.priority as 'High' | 'Medium' | 'Low') ?? undefined,
    progress: p.progress ?? undefined,
    remarks: p.remarks ?? undefined,
    previousVersions: p.previousVersions?.map((v) => ({
      version: v.version,
      date: v.date,
      submittedBy: v.submittedBy,
      changes: v.changes ?? '',
      url: v.url ?? undefined,
    })),
    review: p.review
      ? {
          reviewedBy: p.review.reviewedBy,
          reviewDate: p.review.reviewDate,
          decision: p.review.decision ?? undefined,
          approvalDate: p.review.approvalDate ?? undefined,
          comments: p.review.comments ?? undefined,
        }
      : undefined,
    commentTracker: p.commentTracker?.map((c) => ({
      id: c.id,
      no: c.no,
      discipline: c.discipline,
      date: c.date,
      commentedBy: c.commentedBy,
      comments: c.comments,
      actionRequired: c.actionRequired,
      response: c.response,
      status: c.status as 'Open' | 'In Progress' | 'Addressed' | 'Closed',
    })),
    isDeleted: p.isDeleted,
    deletedAt: p.deletedAt ?? undefined,
  };
}

export { mapApiToProject };

export function useDesignProjects(params?: {
  leadArchitectId?: string;
  submittedById?: string;
  deleted?: boolean;
}) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const companyId = currentUser?.companyId;

  const [projects, setProjects] = useState<(DesignProject & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!companyId) {
      setProjects([]);
      setLoading(false);
      setError(null);
      console.log('Skipping design projects fetch: no companyId yet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await designProjectsApi.list({
        limit: 500,
        deleted: params?.deleted ? 'true' : 'false',
        leadArchitectId: params?.leadArchitectId,
        submittedById: params?.submittedById,
      });

      setProjects((res.data ?? []).map(mapApiToProject));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load design projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, params?.leadArchitectId, params?.submittedById, params?.deleted]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const updateProject = useCallback(
    async (id: string, updates: Partial<DesignProject>) => {
      if (!companyId) return false;

      try {
        const updated = await designProjectsApi.update(id, updates);
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? mapApiToProject(updated) : p))
        );
        return true;
      } catch {
        return false;
      }
    },
    [companyId]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!companyId) return false;

      try {
        await designProjectsApi.delete(id);
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() }
              : p
          )
        );
        return true;
      } catch {
        return false;
      }
    },
    [companyId]
  );

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    updateProject,
    deleteProject,
  };
}