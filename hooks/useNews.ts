'use client';

import { useState, useCallback, useEffect } from 'react';
import { newsApi, type NewsApi } from '@/lib/api';

export interface NewsItemRecord {
  id: string;
  title: string;
  description: string;
  content?: string;
  author?: string;
  category?: string;
  image?: string;
  video?: string;
  createdAt?: string;
}

function mapApiToNews(a: NewsApi): NewsItemRecord {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    content: a.content,
    author: a.author,
    category: a.category,
    image: a.image,
    video: a.video,
    createdAt: a.createdAt,
  };
}

export function useNews(params?: { category?: string }) {
  const [news, setNews] = useState<NewsItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await newsApi.list(params);
      setNews(Array.isArray(list) ? list.map(mapApiToNews) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [params?.category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const getNews = useCallback(async (id: string) => {
    try {
      const a = await newsApi.get(id);
      return mapApiToNews(a);
    } catch {
      return null;
    }
  }, []);

  return { news, loading, error, refetch: fetchNews, getNews };
}
