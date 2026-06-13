//api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-server';
import type { UserRole } from '@/app/generated/prisma/client';

function toAuthUser(user: {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string | null;
  passwordHash: string | null;
  tempPasswordHash: string | null;
  tempPasswordExpiresAt: Date | null;
  mustChangePassword: boolean;
}) {
  return {
    id: user.id,
    companyId: user.companyId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department ?? undefined,
    passwordHash: user.passwordHash,
    tempPasswordHash: user.tempPasswordHash,
    tempPasswordExpiresAt: user.tempPasswordExpiresAt?.toISOString() ?? null,
    mustChangePassword: user.mustChangePassword,
  };
}

/** POST /api/auth/login */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        reason: 'not_found',
      });
    }

    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        reason: 'inactive',
      });
    }

    const now = new Date();

    const hasValidTempPassword =
      Boolean(user.tempPasswordHash) &&
      Boolean(user.tempPasswordExpiresAt) &&
      user.tempPasswordExpiresAt! > now;

    const hashToCheck = hasValidTempPassword
      ? user.tempPasswordHash
      : user.passwordHash;

    if (!hashToCheck || !verifyPassword(password, hashToCheck)) {
      return NextResponse.json({
        success: false,
        reason: 'wrong_password',
      });
    }

    return NextResponse.json({
      success: true,
      user: toAuthUser(user),
    });
  } catch (e) {
    console.error('Login failed:', e);

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}