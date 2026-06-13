//api/users/[id]/reset-temp-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateTempPassword,
  getTempExpiry,
  hashPassword,
} from '@/lib/auth-server';
import { sendEmployeeTempPasswordEmail } from '@/lib/email';

function getCompanyId(request: NextRequest): string | null {
  return request.headers.get('x-company-id');
}

/** POST /api/users/[id]/reset-temp-password — regenerate temporary password */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = getCompanyId(request);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const tempPassword = generateTempPassword(10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tempPasswordHash: hashPassword(tempPassword),
        tempPasswordExpiresAt: getTempExpiry(72),
        mustChangePassword: true,
        isActive: true,
      },
    });

    await sendEmployeeTempPasswordEmail({
      to: user.email,
      employeeName: user.fullName,
      tempPassword,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reset temp password:', error);

    return NextResponse.json(
      { error: 'Failed to reset temporary password' },
      { status: 500 }
    );
  }
}