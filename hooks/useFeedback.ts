'use client';

import { useState, useCallback, useEffect } from 'react';
import { feedbackApi, type FeedbackApi } from '@/lib/api';

export interface FeedbackRecord {
  id: string;
  anonymousId: string;
  category: string;
  message: string;
  rating: number;
  date: string;
  status: string;
  notes?: Array<{ id: string; note: string; addedBy: string }>;
}

function mapApiToFeedback(a: FeedbackApi): FeedbackRecord {
  return {
    id: a.id,
    anonymousId: a.anonymousId,
    category: a.category,
    message: a.message,
    rating: a.rating,
    date: a.date,
    status: a.status,
    notes: a.notes,
  };
}

export function useFeedback(params?: { status?: string; category?: string }) {
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await feedbackApi.list(params);
      setFeedback(Array.isArray(list) ? list.map(mapApiToFeedback) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feedback');
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.category]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getFeedback = useCallback(async (id: string) => {
    try {
      const a = await feedbackApi.get(id);
      return mapApiToFeedback(a);
    } catch {
      return null;
    }
  }, []);

  const createFeedback = useCallback(async (body: Record<string, unknown>) => {
    try {
      const a = await feedbackApi.create(body);
      setFeedback((prev) => [mapApiToFeedback(a), ...prev]);
      return mapApiToFeedback(a);
    } catch {
      return null;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      const a = await feedbackApi.updateStatus(id, status);
      setFeedback((prev) => prev.map((x) => (x.id === id ? mapApiToFeedback(a) : x)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const addNote = useCallback(async (id: string, note: string, addedById: string) => {
    try {
      await feedbackApi.addNote(id, note, addedById);
      await fetchFeedback();
      return true;
    } catch {
      return false;
    }
  }, [fetchFeedback]);

  return { feedback, loading, error, refetch: fetchFeedback, getFeedback, createFeedback, updateStatus, addNote };
}
