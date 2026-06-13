'use client';

import { useState, useCallback, useEffect } from 'react';
import { onboardingApi, type OnboardingWorkflowApi, type OnboardingDocumentApi } from '@/lib/api';

export type OnboardingWorkflowRecord = OnboardingWorkflowApi;
export type OnboardingDocumentRecord = OnboardingDocumentApi;

export function useOnboardingWorkflows() {
  const [workflows, setWorkflows] = useState<OnboardingWorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await onboardingApi.listWorkflows();
      setWorkflows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load onboarding workflows');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return { workflows, loading, error, refetch: fetchWorkflows };
}

export function useOnboardingDocuments(workflowId: string | null) {
  const [documents, setDocuments] = useState<OnboardingDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!workflowId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await onboardingApi.getDocuments(workflowId);
      setDocuments(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = useCallback(
    async (body: Record<string, unknown>) => {
      if (!workflowId) return null;
      try {
        const d = await onboardingApi.createDocument(workflowId, body);
        setDocuments((prev) => [...prev, d]);
        return d;
      } catch {
        return null;
      }
    },
    [workflowId]
  );

  const updateDocument = useCallback(async (id: string, body: Record<string, unknown>) => {
    try {
      const d = await onboardingApi.updateDocument(id, body);
      setDocuments((prev) => prev.map((x) => (x.id === id ? d : x)));
      return d;
    } catch {
      return null;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await onboardingApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((x) => x.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}
