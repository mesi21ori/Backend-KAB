// app/api/firms/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CompanyType,
  Prisma,
} from "@/app/generated/prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateFirmBody = {
  name?: string;
  type?: string;
  description?: string | null;
  slug?: string | null;
};

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
 * GET /api/firms/[id]
 * Get company by id or slug
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          error: "Firm id or slug is required",
        },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst({
      where: {
        OR: [
          {
            id,
          },
          {
            slug: id,
          },
        ],
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          error: "Firm not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: company.id,
        name: company.name,
        type: company.type,
        description: company.description,
        slug: company.slug,
        isActive: company.isActive,
        userCount: company._count.users,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET FIRM ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to get firm",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/firms/[id]
 * Update company name, type, description, or slug
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          error: "Firm id or slug is required",
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateFirmBody;

    const {
      name,
      type: rawType,
      description,
      slug,
    } = body;

    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          {
            id,
          },
          {
            slug: id,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        {
          error: "Firm not found",
        },
        { status: 404 }
      );
    }

    const type =
      rawType !== undefined ? parseCompanyType(rawType) : undefined;

    if (rawType !== undefined && !type) {
      return NextResponse.json(
        {
          error:
            "Invalid type. Allowed values: design, construction, design_construction",
        },
        { status: 400 }
      );
    }

    const data: Prisma.CompanyUpdateInput = {};

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return NextResponse.json(
          {
            error: "Company name cannot be empty",
          },
          { status: 400 }
        );
      }

      data.name = trimmedName;
    }

    if (type !== undefined) {
      data.type = type;
    }

    if (description !== undefined) {
      data.description =
        description === null || description.trim() === ""
          ? null
          : description.trim();
    }

    if (slug !== undefined) {
      if (slug === null || slug.trim() === "") {
        return NextResponse.json(
          {
            error: "Slug cannot be empty",
          },
          { status: 400 }
        );
      }

      data.slug = normalizeSlug(slug);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          error: "No valid fields provided for update",
        },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: {
        id: existingCompany.id,
      },
      data,
    });

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT FIRM ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "Slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update firm",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/firms/[id]
 * Delete company only if no users are linked
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          error: "Firm id or slug is required",
        },
        { status: 400 }
      );
    }

    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          {
            id,
          },
          {
            slug: id,
          },
        ],
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        {
          error: "Firm not found",
        },
        { status: 404 }
      );
    }

    if (existingCompany._count.users > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete firm while users are still linked. Unassign users first.",
        },
        { status: 409 }
      );
    }

    await prisma.company.delete({
      where: {
        id: existingCompany.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE FIRM ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete firm",
      },
      { status: 500 }
    );
  }
}