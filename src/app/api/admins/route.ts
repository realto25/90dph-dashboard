import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Helper to check if the current user is SUPERADMIN
async function isSuperAdmin(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  return user?.role === 'SUPERADMIN';
}

// GET - List all admins and superadmins
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ role: UserRole.ADMIN }, { role: UserRole.SUPERADMIN }]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

// POST - Create a new admin (SUPERADMIN only)
export async function POST(request: NextRequest) {
  if (!(await isSuperAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, email, role, clerkId, phone } = body;
    if (!name || !email || !role || !clerkId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    if (![UserRole.ADMIN, UserRole.SUPERADMIN].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be ADMIN or SUPERADMIN' },
        { status: 400 }
      );
    }
    const user = await prisma.user.create({
      data: { name, email, role, clerkId, phone },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}

// PUT - Update an admin (SUPERADMIN only)
export async function PUT(request: NextRequest) {
  if (!(await isSuperAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id, name, email, role, phone } = body;
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    if (![UserRole.ADMIN, UserRole.SUPERADMIN].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be ADMIN or SUPERADMIN' },
        { status: 400 }
      );
    }
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, phone },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an admin (SUPERADMIN only)
export async function DELETE(request: NextRequest) {
  if (!(await isSuperAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}
