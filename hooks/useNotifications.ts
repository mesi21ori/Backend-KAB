'use client';

import { useState, useCallback, useEffect } from 'react';
import { notificationsApi, type NotificationApi } from '@/lib/api';

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  link?: string;
  actionRequired?: boolean;
  createdAt?: string;
}

// ✅ Map API → UI
function mapApiToNotification(a: NotificationApi): NotificationRecord {
  return {
    id: a.id,
    title: a.title,
    message: a.message,
    type: a.type,
    category: a.category,
    isRead: a.isRead,
    link: a.link,
    actionRequired: a.actionRequired,
    createdAt: a.createdAt,
  };
}

export function useNotifications(
  userId: string | null,
  params?: { isRead?: boolean; category?: string }
) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await notificationsApi.list(userId, {
        isRead:
          params?.isRead !== undefined
            ? String(params.isRead) // ✅ convert boolean → string
            : undefined,
        category: params?.category,
      });

      setNotifications(
        Array.isArray(list)
          ? list.map(mapApiToNotification)
          : []
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to load notifications'
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId, params?.isRead, params?.category]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ Mark notification as read
  const markRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );

      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markRead,
  };
}