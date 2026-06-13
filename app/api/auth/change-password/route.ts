//api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth-server';

/** POST /api/auth/change-password */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body as {
      userId?: string;
      currentPassword?: string | null;
      newPassword?: string;
    };

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId and newPassword required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, reason: 'no_user' });
    const useTemp = user.tempPasswordHash && user.tempPasswordExpiresAt && user.tempPasswordExpiresAt > new Date();

    // Two flows:
    // 1) Normal change password: currentPassword is provided → verify against current hash
    // 2) First-time set password after temp login: currentPassword is null/empty, but temp is still valid
    if (currentPassword && currentPassword !== '') {
      const hashToCheck = useTemp ? user.tempPasswordHash : user.passwordHash;
      if (!hashToCheck || !verifyPassword(currentPassword, hashToCheck)) {
        return NextResponse.json({ success: false, reason: 'wrong_current' });
      }
    } else {
      // No current password provided: only allow if user is in temp-password flow and must change password
      if (!useTemp || !user.mustChangePassword) {
        return NextResponse.json({ success: false, reason: 'wrong_current' });
      }
    }

    const hashed = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashed,
        tempPasswordHash: null,
        tempPasswordExpiresAt: null,
        mustChangePassword: false,
      },
    });
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department ?? undefined,
        passwordHash: hashed,
        tempPasswordHash: null,
        tempPasswordExpiresAt: null,
        mustChangePassword: false,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Change password failed' }, { status: 500 });
  }
}
