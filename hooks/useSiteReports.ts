'use client';

import { useState, useCallback, useEffect } from 'react';
import { siteReportsApi, type SiteReportApi } from '@/lib/api';
import type { SiteReport } from '@/types/site-report';

function mapApiToReport(r: SiteReportApi): SiteReport {
  return {
    id: r.id,
    projectName: r.projectName,
    location: r.location ?? undefined,
    submittedBy: r.submittedBy,
    position: r.position ?? '—',
    department: r.department as 'Design' | 'Construction',
    submittedAt: r.submittedAt,
    description: r.description,
    images: r.images ?? [],
    status: r.status as 'Pending' | 'Approved' | 'Rejected',
    activities: r.activities,
    materials: r.materials,
    issues: r.issues,
    correspondence: r.correspondence?.map((c) => ({
      refNo: c.refNo,
      issuedBy: c.issuedBy,
      subject: c.subject,
      hasAttachment: c.hasAttachment ?? false,
    })),
    changeRequests: r.changeRequests?.map((c) => ({
      id: c.id,
      request: c.request,
      requestedBy: typeof c.requestedBy === 'string' ? c.requestedBy : (c as { requestedBy?: string }).requestedBy ?? '—',
      requestedAt: c.requestedAt,
    })),
    isDeleted: r.isDeleted,
    deletedAt: r.deletedAt ?? undefined,
  };
}

export function useSiteReports(params?: {
  status?: string;
  department?: string;
  projectId?: string;
  userId?: string;
  deleted?: boolean;
}) {
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await siteReportsApi.list({
        ...params,
        deleted: params?.deleted ? 'true' : undefined,
      });
      setReports(Array.isArray(list) ? list.map(mapApiToReport) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load site reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.department, params?.projectId, params?.userId, params?.deleted]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getReport = useCallback(async (id: string) => {
    try {
      const r = await siteReportsApi.get(id);
      return mapApiToReport(r);
    } catch {
      return null;
    }
  }, []);

  const createReport = useCallback(async (body: Record<string, unknown>) => {
    try {
      const r = await siteReportsApi.create(body);
      setReports((prev) => [mapApiToReport(r), ...prev]);
      return mapApiToReport(r);
    } catch {
      return null;
    }
  }, []);

  const updateReport = useCallback(async (id: string, body: Record<string, unknown>) => {
    try {
      const r = await siteReportsApi.update(id, body);
      setReports((prev) => prev.map((x) => (x.id === id ? mapApiToReport(r) : x)));
      return mapApiToReport(r);
    } catch {
      return null;
    }
  }, []);

  const approveReport = useCallback(async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await siteReportsApi.approve(id, status);
      setReports((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    try {
      await siteReportsApi.delete(id);
      setReports((prev) => prev.filter((x) => x.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    getReport,
    createReport,
    updateReport,
    approveReport,
    deleteReport,
  };
}
