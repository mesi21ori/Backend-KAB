//api/users/[id]/deactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getCompanyId(request: NextRequest): string | null {
  return request.headers.get('x-company-id');
}

/** POST /api/users/[id]/deactivate — soft-deactivate user */
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: null,
        tempPasswordHash: null,
        tempPasswordExpiresAt: null,
        mustChangePassword: false,
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deactivate user error:', error);

    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}