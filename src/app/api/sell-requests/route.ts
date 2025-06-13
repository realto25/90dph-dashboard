import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plotId, reason, clerkId } = body;
    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
    }
    if (!plotId || !reason) {
      return NextResponse.json(
        { error: 'Plot ID and reason are required' },
        { status: 400 }
      );
    }
    // Check if plot exists and is owned by the user
    const plot = await prisma.plot.findFirst({
      where: {
        id: plotId,
        ownerId: clerkId
      }
    });
    if (!plot) {
      return NextResponse.json(
        { error: 'Plot not found or not owned by user' },
        { status: 404 }
      );
    }
    // Create sell request
    const sellRequest = await prisma.sellRequest.create({
      data: {
        plotId,
        userId: clerkId,
        reason,
        status: 'pending'
      },
      include: {
        plot: {
          select: {
            title: true,
            dimension: true,
            price: true,
            location: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    return NextResponse.json(sellRequest);
  } catch (error) {
    console.error('Error creating sell request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userRole = searchParams.get('role');
    const clerkId = searchParams.get('clerkId');
    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
    }
    // Build the where clause based on user role and status
    const where: any = {};
    if (userRole === 'CLIENT') {
      where.userId = clerkId;
    }
    if (status) {
      where.status = status;
    }
    const sellRequests = await prisma.sellRequest.findMany({
      where,
      include: {
        plot: {
          select: {
            title: true,
            dimension: true,
            price: true,
            location: true,
            imageUrls: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(sellRequests);
  } catch (error) {
    console.error('Error fetching sell requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
