'use client';

import { useState, useCallback, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export interface UserRecord {
  id: string;
  companyId?: string;
  fullName: string;
  email: string;
  role: string;
  isActive?: boolean;
  department?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type UseUsersParams = {
  companyId?: string;
  role?: string;
  department?: string;
};

type CreateUserInput = {
  companyId?: string;
  fullName: string;
  email: string;
  role?: string;
  department?: string;
  tempPassword?: string;
};

type UpdateUserInput = Partial<CreateUserInput>;

function normalizeUser(u: any, fallbackCompanyId?: string): UserRecord {
  return {
    id: String(u.id),
    companyId: u.companyId ?? fallbackCompanyId,
    fullName: String(u.fullName ?? ''),
    email: String(u.email ?? ''),
    role: String(u.role ?? 'EMPLOYEE'),
    department: u.department ?? null,
    isActive: u.isActive ?? true,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function useUsers(params?: UseUsersParams) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const companyId = params?.companyId ?? currentUser?.companyId;

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!companyId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
 const list = await usersApi.list({
  role: params?.role,
  department: params?.department,
});
      

      setUsers(
        Array.isArray(list)
          ? list.map((u) => normalizeUser(u, companyId))
          : []
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, params?.role, params?.department]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const getUser = useCallback(async (id: string) => {
    try {
      const user = await usersApi.get(id);
      return normalizeUser(user, companyId);
    } catch {
      return null;
    }
  }, [companyId]);

  const createUser = useCallback(
    async (body: CreateUserInput) => {
      try {
        const user = await usersApi.create({
          ...body,
          companyId: body.companyId ?? companyId ?? '',
        } as any);

        const record = normalizeUser(user, body.companyId ?? companyId);

        setUsers((prev) => [...prev, record]);

        return record;
      } catch {
        return null;
      }
    },
    [companyId]
  );

  const updateUser = useCallback(
    async (id: string, body: UpdateUserInput) => {
      try {
        const user = await usersApi.update(id, body as any);

        if (!user) return null;

        const record = normalizeUser(user, companyId);

        setUsers((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  ...record,
                  companyId: record.companyId ?? x.companyId,
                }
              : x
          )
        );

        return record;
      } catch {
        return null;
      }
    },
    [companyId]
  );

  const deleteUser = useCallback(async (id: string) => {
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((x) => x.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
}