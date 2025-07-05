import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Fetch visit requests by clerkId (user or assigned manager)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    if (!clerkId) {
      return NextResponse.json(
        { error: 'clerkId is required' },
        { status: 400 }
      );
    }

    // Find all visit requests where user.clerkId or assignedManager.clerkId matches
    const visitRequests = await prisma.visitRequest.findMany({
      where: {
        OR: [{ user: { clerkId } }, { assignedManager: { clerkId } }]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            clerkId: true
          }
        },
        plot: {
          select: {
            id: true,
            title: true,
            location: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignedManager: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true
          }
        }
      }
    });

    return NextResponse.json(visitRequests);
  } catch (error) {
    console.error('Error fetching visit requests by clerkId:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visit requests by clerkId' },
      { status: 500 }
    );
  }
}

// PATCH - Update visit request status (approve/reject) and assign manager by id
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, managerId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Visit request ID is required' },
        { status: 400 }
      );
    }

    if (status && !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (managerId) updateData.assignedManagerId = managerId;

    const visitRequest = await prisma.visitRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            clerkId: true
          }
        },
        plot: {
          select: {
            id: true,
            title: true,
            location: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignedManager: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true
          }
        }
      }
    });

    // Generate QR code if approved
    let qrCode = null;
    if (status === 'APPROVED') {
      // Always generate QR code with only the id as a string
      qrCode = (await import('qrcode')).default.toDataURL(visitRequest.id);
    }

    const response = {
      ...visitRequest,
      qrCode,
      expiresAt:
        status === 'APPROVED'
          ? new Date(
              visitRequest.createdAt.getTime() + 24 * 60 * 60 * 1000
            ).toISOString()
          : null
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating visit request:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Visit request not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update visit request' },
      { status: 500 }
    );
  }
}
