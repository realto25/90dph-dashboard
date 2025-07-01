import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Helper: Find user by Clerk ID or DB ID
async function findUser(userId: string) {
  // Try by DB ID first, then by Clerk ID
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { clerkId: userId } });
  }
  return user;
}

// POST - Create a new buy request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { plotId, userId, message } = body;

    if (!plotId || !userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure plotId is a string (not array)
    if (Array.isArray(plotId)) plotId = plotId[0];

    // Find or create available land for this plot
    let land = await prisma.land.findFirst({
      where: { plotId: plotId, status: 'AVAILABLE' },
      include: { plot: true }
    });

    if (!land) {
      const plot = await prisma.plot.findUnique({ where: { id: plotId } });
      if (!plot) {
        return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
      }
      if (plot.status !== 'AVAILABLE') {
        return NextResponse.json(
          { error: 'Plot is not available for purchase' },
          { status: 400 }
        );
      }
      // Create dummy land
      land = await prisma.land.create({
        data: {
          number: 'AUTO-GENERATED',
          size: plot.dimension,
          price: plot.price,
          status: 'AVAILABLE',
          plotId: plot.id
        },
        include: { plot: true }
      });
    }

    // Find user by DB ID or Clerk ID
    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create buy request
    const buyRequest = await prisma.buyRequest.create({
      data: {
        landId: land.id,
        userId: user.id,
        message
      },
      include: {
        land: { include: { plot: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clerkId: true
          }
        }
      }
    });

    return NextResponse.json(buyRequest);
  } catch (error) {
    console.error('Error creating buy request:', error);
    return NextResponse.json(
      { error: 'Failed to create buy request' },
      { status: 500 }
    );
  }
}

// GET - Fetch buy requests (optionally by userId and/or status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;

    const buyRequests = await prisma.buyRequest.findMany({
      where: whereClause,
      include: {
        land: { include: { plot: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clerkId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(buyRequests);
  } catch (error) {
    console.error('Error fetching buy requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buy requests' },
      { status: 500 }
    );
  }
}

// PATCH - Update buy request status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const buyRequest = await prisma.buyRequest.update({
      where: { id },
      data: { status },
      include: {
        land: { include: { plot: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clerkId: true
          }
        }
      }
    });

    // If request is approved, update land status
    if (status === 'APPROVED') {
      await prisma.land.update({
        where: { id: buyRequest.landId },
        data: { status: 'ADVANCE' }
      });
    }

    return NextResponse.json(buyRequest);
  } catch (error) {
    console.error('Error updating buy request:', error);
    return NextResponse.json(
      { error: 'Failed to update buy request' },
      { status: 500 }
    );
  }
}
