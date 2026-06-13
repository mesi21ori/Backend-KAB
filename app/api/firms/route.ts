// app/api/firms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-server";
import {
  CompanyType,
  UserRole,
  Prisma,
} from "@/app/generated/prisma/client";

type CreateFirmBody = {
  name?: string;
  type?: string;
  description?: string;
  slug?: string;
  primaryFullName?: string;
  primaryEmail?: string;
  primaryPassword?: string;
};

type CompanyWithUserCount = Prisma.CompanyGetPayload<{
  include: {
    _count: {
      select: {
        users: true;
      };
    };
  };
}>;

function parseCompanyType(
  value: string | null | undefined
): CompanyType | undefined {
  if (value === "design") return CompanyType.design;
  if (value === "construction") return CompanyType.construction;
  if (value === "design_construction") {
    return CompanyType.design_construction;
  }

  return undefined;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/firms
 */
export async function GET(request: NextRequest) {
  try {
    const rawType = request.nextUrl.searchParams.get("type");
    const type = parseCompanyType(rawType);

    if (rawType && !type) {
      return NextResponse.json(
        {
          error:
            "Invalid type. Allowed values: design, construction, design_construction",
        },
        { status: 400 }
      );
    }

    const list = await prisma.company.findMany({
      where: type ? { type } : undefined,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    const formattedCompanies = list.map((company: CompanyWithUserCount) => ({
      id: company.id,
      name: company.name,
      type: company.type,
      description: company.description,
      slug: company.slug,
      isActive: company.isActive,
      userCount: company._count.users,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedCompanies, { status: 200 });
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to list firms",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/firms
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateFirmBody;

    const {
      name,
      type: rawType,
      description,
      slug,
      primaryFullName,
      primaryEmail,
      primaryPassword,
    } = body;

    if (!name?.trim() || !rawType?.trim() || !slug?.trim()) {
      return NextResponse.json(
        {
          error: "name, type and slug are required",
        },
        { status: 400 }
      );
    }

    if (
      !primaryFullName?.trim() ||
      !primaryEmail?.trim() ||
      !primaryPassword?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "primaryFullName, primaryEmail and primaryPassword are required",
        },
        { status: 400 }
      );
    }

    const type = parseCompanyType(rawType);

    if (!type) {
      return NextResponse.json(
        {
          error:
            "Invalid type. Allowed values: design, construction, design_construction",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = primaryEmail.trim().toLowerCase();
    const normalizedSlug = normalizeSlug(slug);

    if (!normalizedSlug) {
      return NextResponse.json(
        {
          error: "slug is required",
        },
        { status: 400 }
      );
    }

    if (primaryPassword.length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    const existingCompanySlug = await prisma.company.findUnique({
      where: {
        slug: normalizedSlug,
      },
      select: {
        id: true,
      },
    });

    if (existingCompanySlug) {
      return NextResponse.json(
        {
          error: "A company with this slug already exists",
        },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const company = await tx.company.create({
          data: {
            name: name.trim(),
            type,
            description: description?.trim() || null,
            slug: normalizedSlug,
            isActive: true,
          },
        });

        const existingUser = await tx.user.findFirst({
          where: {
            companyId: company.id,
            email: normalizedEmail,
          },
          select: {
            id: true,
          },
        });

        if (existingUser) {
          throw new Error("EMAIL_ALREADY_EXISTS_IN_COMPANY");
        }

        const adminUser = await tx.user.create({
          data: {
            companyId: company.id,
            fullName: primaryFullName.trim(),
            email: normalizedEmail,
            passwordHash: await hashPassword(primaryPassword),
            mustChangePassword: false,
            role: UserRole.GENERAL_MANAGER,
            isActive: true,
          },
        });

        return {
          company,
          adminUser,
        };
      }
    );

    const { company, adminUser } = result;

    return NextResponse.json(
      {
        id: company.id,
        name: company.name,
        type: company.type,
        description: company.description,
        slug: company.slug,
        isActive: company.isActive,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
        adminUser: {
          id: adminUser.id,
          fullName: adminUser.fullName,
          email: adminUser.email,
          role: adminUser.role,
          companyId: adminUser.companyId,
          isActive: adminUser.isActive,
          mustChangePassword: adminUser.mustChangePassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE COMPANY ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS_IN_COMPANY"
    ) {
      return NextResponse.json(
        {
          error: "An account with this email already exists in this company",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create firm",
      },
      { status: 500 }
    );
  }
}