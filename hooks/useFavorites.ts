'use client';

import { useState, useCallback, useEffect } from 'react';
import { favoritesApi, type FavoriteApi } from '@/lib/api';
import type { FavoriteItem, FavoriteType } from '@/types/favorites';

const API_TYPE_TO_FRONT: Record<string, FavoriteType> = {
  design_project: 'design-project',
  construction_project: 'construction-project',
  site_report: 'site-report',
  letter: 'letter',
};

const FRONT_TYPE_TO_API: Record<FavoriteType, string> = {
  'design-project': 'design_project',
  'construction-project': 'construction_project',
  'site-report': 'site_report',
  letter: 'letter',
};

function mapApiToItem(f: FavoriteApi): FavoriteItem {
  return {
    type: (API_TYPE_TO_FRONT[f.type] ?? f.type) as FavoriteType,
    id: f.refId,
    name: f.name,
    url: f.url,
    addedAt: f.addedAt,
  };
}

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await favoritesApi.list(userId);
      setFavorites(Array.isArray(list) ? list.map(mapApiToItem) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const add = useCallback(
    async (item: Omit<FavoriteItem, 'addedAt'>) => {
      if (!userId) return false;
      try {
        const apiType = FRONT_TYPE_TO_API[item.type];
        await favoritesApi.add({
          userId,
          type: apiType,
          refId: item.id,
          name: item.name,
          url: item.url,
        });
        await fetchFavorites();
        return true;
      } catch {
        return false;
      }
    },
    [userId, fetchFavorites]
  );

  const remove = useCallback(
    async (type: FavoriteType, id: string) => {
      if (!userId) return false;
      try {
        const apiType = FRONT_TYPE_TO_API[type];
        await favoritesApi.remove(userId, apiType, id);
        await fetchFavorites();
        return true;
      } catch {
        return false;
      }
    },
    [userId, fetchFavorites]
  );

  const isFavorite = useCallback(
    (type: FavoriteType, id: string) => {
      return favorites.some((f) => f.type === type && f.id === id);
    },
    [favorites]
  );

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
    add,
    remove,
    isFavorite,
  };
}
