import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/app/generated/prisma/client';

function getCompanyId(request: NextRequest): string | null {
  return request.headers.get('x-company-id');
}

function parseUserRole(value: unknown): UserRole | undefined {
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
  createdAt?: Date;
  updatedAt?: Date;
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
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

function setOptionalString(
  data: Record<string, unknown>,
  key: string,
  value: unknown
) {
  if (value !== undefined) {
    data[key] = value === null || value === '' ? null : String(value);
  }
}

/** GET /api/users/[id] */
export async function GET(
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toSafeUser(user));
  } catch (error) {
    console.error('GET user error:', error);

    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

/** PUT /api/users/[id] */
export async function PUT(
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
    const body = await request.json();

    const {
      fullName,
      email,
      role,
      department,
      legacyRole,

      profilePhotoUrl,
      idDocumentUrl,
      licenseDocumentUrl,
      dateOfBirth,
      nationality,
      phoneNumber,
      homeAddress,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      jobTitle,
      employmentType,
      startDate,
      nationalIdPassport,
      professionalLicenseNumber,
      tinNumber,
      bankName,
      accountName,
      accountNumber,
    } = body as Record<string, unknown>;

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof fullName === 'string') {
      data.fullName = fullName.trim();
    }

    if (typeof email === 'string') {
      const normalizedEmail = email.trim().toLowerCase();

      const duplicateEmail = await prisma.user.findFirst({
        where: {
          companyId,
          email: normalizedEmail,
          NOT: {
            id: existingUser.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email already exists in this company' },
          { status: 409 }
        );
      }

      data.email = normalizedEmail;
    }

    if (role !== undefined) {
      const parsedRole = parseUserRole(role);

      if (!parsedRole) {
        return NextResponse.json(
          {
            error:
              'Invalid role. Allowed values: GENERAL_MANAGER, HEADS, EMPLOYEE',
          },
          { status: 400 }
        );
      }

      data.role = parsedRole;
    }

    setOptionalString(data, 'department', department);
    setOptionalString(data, 'legacyRole', legacyRole);
    setOptionalString(data, 'profilePhotoUrl', profilePhotoUrl);
    setOptionalString(data, 'idDocumentUrl', idDocumentUrl);
    setOptionalString(data, 'licenseDocumentUrl', licenseDocumentUrl);
    setOptionalString(data, 'dateOfBirth', dateOfBirth);
    setOptionalString(data, 'nationality', nationality);
    setOptionalString(data, 'phoneNumber', phoneNumber);
    setOptionalString(data, 'homeAddress', homeAddress);
    setOptionalString(data, 'emergencyContactName', emergencyContactName);
    setOptionalString(data, 'emergencyContactPhone', emergencyContactPhone);
    setOptionalString(
      data,
      'emergencyContactRelationship',
      emergencyContactRelationship
    );
    setOptionalString(data, 'jobTitle', jobTitle);
    setOptionalString(data, 'employmentType', employmentType);
    setOptionalString(data, 'startDate', startDate);
    setOptionalString(data, 'nationalIdPassport', nationalIdPassport);
    setOptionalString(
      data,
      'professionalLicenseNumber',
      professionalLicenseNumber
    );
    setOptionalString(data, 'tinNumber', tinNumber);
    setOptionalString(data, 'bankName', bankName);
    setOptionalString(data, 'accountName', accountName);
    setOptionalString(data, 'accountNumber', accountNumber);

    const user = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data,
    });

    return NextResponse.json(toSafeUser(user));
  } catch (error) {
    console.error('PUT user error:', error);

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/** DELETE /api/users/[id] */
export async function DELETE(
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

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: {
        id: existingUser.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE user error:', error);

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}