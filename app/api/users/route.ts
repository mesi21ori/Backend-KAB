//
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, Prisma } from '@/app/generated/prisma/client';

function getCompanyId(request: NextRequest): string | null {
  return request.headers.get('x-company-id');
}

function parseUserRole(value: string | null | undefined): UserRole | undefined {
  if (value === 'GENERAL_MANAGER') return UserRole.GENERAL_MANAGER;
  if (value === 'HEADS') return UserRole.HEADS;
  if (value === 'EMPLOYEE') return UserRole.EMPLOYEE;
  if (value === 'HEAD') return UserRole.HEADS;
  return undefined;
}

function toSafeUser(user: {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string | null;
  legacyRole: string | null;
  profilePhotoUrl?: string | null;
  idDocumentUrl?: string | null;
  licenseDocumentUrl?: string | null;
  isActive?: boolean | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  phoneNumber?: string | null;
  homeAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  jobTitle?: string | null;
  employmentType?: string | null;
  startDate?: string | null;
  nationalIdPassport?: string | null;
  professionalLicenseNumber?: string | null;
  tinNumber?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    companyId: user.companyId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department ?? undefined,
    legacyRole: user.legacyRole ?? undefined,
    isActive: user.isActive ?? true,
    profilePhotoUrl: user.profilePhotoUrl ?? undefined,
    idDocumentUrl: user.idDocumentUrl ?? undefined,
    licenseDocumentUrl: user.licenseDocumentUrl ?? undefined,
    dateOfBirth: user.dateOfBirth ?? undefined,
    nationality: user.nationality ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    homeAddress: user.homeAddress ?? undefined,
    emergencyContactName: user.emergencyContactName ?? undefined,
    emergencyContactPhone: user.emergencyContactPhone ?? undefined,
    emergencyContactRelationship: user.emergencyContactRelationship ?? undefined,
    jobTitle: user.jobTitle ?? undefined,
    employmentType: user.employmentType ?? undefined,
    startDate: user.startDate ?? undefined,
    nationalIdPassport: user.nationalIdPassport ?? undefined,
    professionalLicenseNumber: user.professionalLicenseNumber ?? undefined,
    tinNumber: user.tinNumber ?? undefined,
    bankName: user.bankName ?? undefined,
    accountName: user.accountName ?? undefined,
    accountNumber: user.accountNumber ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/** GET /api/users */
export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawRole = searchParams.get('role');
    const department = searchParams.get('department');

    const role = parseUserRole(rawRole);

    if (rawRole && !role) {
      return NextResponse.json(
        { error: 'Invalid role. Allowed values: GENERAL_MANAGER, HEADS, EMPLOYEE' },
        { status: 400 }
      );
    }

    const where: Prisma.UserWhereInput = {
      companyId,
    };

    if (role) where.role = role;
    if (department) where.department = department;

    const users = await prisma.user.findMany({
      where,
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(users.map(toSafeUser));
  } catch (error) {
    console.error('GET users error:', error);

    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    );
  }
}

/** POST /api/users */
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { fullName, email, role, department, tempPassword } = body as {
      fullName?: string;
      email?: string;
      role?: string;
      department?: string;
      tempPassword?: string;
    };

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'fullName and email required' },
        { status: 400 }
      );
    }

    const prismaRole = parseUserRole(role ?? 'EMPLOYEE');

    if (!prismaRole) {
      return NextResponse.json(
        { error: 'Invalid role. Allowed values: GENERAL_MANAGER, HEADS, EMPLOYEE' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        companyId,
        email: normalizedEmail,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists in this company' },
        { status: 409 }
      );
    }

    const { hashPassword, getTempExpiry } = await import('@/lib/auth-server');

    const tempPass = tempPassword ?? 'ChangeMe1!';
    const tempHash = hashPassword(tempPass);

    const user = await prisma.user.create({
      data: {
        companyId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        role: prismaRole,
        department: department?.trim() || null,
        tempPasswordHash: tempHash,
        tempPasswordExpiresAt: getTempExpiry(72),
        mustChangePassword: true,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        ...toSafeUser(user),
        tempPassword: tempPassword ? undefined : tempPass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST user error:', error);

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}