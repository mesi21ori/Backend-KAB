'use client';

import { useState, useCallback, useEffect } from 'react';
import { lettersApi, type LetterApi } from '@/lib/api';

export interface LetterRecord {
  id: string;
  referenceNo: string;
  subject: string;
  createdBy: string;
  dateCreated: string;
  status: string;
  body: string;
  sharedWith?: string[];
}

function mapApiToLetter(a: LetterApi): LetterRecord {
  return {
    id: a.id,
    referenceNo: a.referenceNo,
    subject: a.subject,
    createdBy: a.createdBy,
    dateCreated: a.dateCreated,
    status: a.status,
    body: a.body,
    sharedWith: a.sharedWith ?? a.sharedWithIds,
  };
}

export function useLetters(params?: { status?: string; userId?: string }) {
  const [letters, setLetters] = useState<LetterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await lettersApi.list(params);
      setLetters(Array.isArray(list) ? list.map(mapApiToLetter) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load letters');
      setLetters([]);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.userId]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const getLetter = useCallback(async (id: string) => {
    try {
      const a = await lettersApi.get(id);
      return mapApiToLetter(a);
    } catch {
      return null;
    }
  }, []);

  const createLetter = useCallback(async (body: Record<string, unknown>) => {
    try {
      const a = await lettersApi.create(body);
      setLetters((prev) => [mapApiToLetter(a), ...prev]);
      return mapApiToLetter(a);
    } catch {
      return null;
    }
  }, []);

  const updateLetter = useCallback(async (id: string, body: Record<string, unknown>) => {
    try {
      const a = await lettersApi.update(id, body);
      setLetters((prev) => prev.map((x) => (x.id === id ? mapApiToLetter(a) : x)));
      return mapApiToLetter(a);
    } catch {
      return null;
    }
  }, []);

  const shareLetter = useCallback(async (id: string, userIds: string[]) => {
    try {
      await lettersApi.share(id, userIds);
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteLetter = useCallback(async (id: string) => {
    try {
      await lettersApi.delete(id);
      setLetters((prev) => prev.filter((x) => x.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    letters,
    loading,
    error,
    refetch: fetchLetters,
    getLetter,
    createLetter,
    updateLetter,
    shareLetter,
    deleteLetter,
  };
}
