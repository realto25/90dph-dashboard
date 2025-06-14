import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all leave requests or filter by manager
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    const whereClause = clerkId
      ? {
          manager: {
            clerkId
          }
        }
      : {};

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create a new leave request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, startDate, endDate, reason } = body;

    if (!clerkId || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the manager by clerkId
    const manager = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        managerId: manager.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      },
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update leave request status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
