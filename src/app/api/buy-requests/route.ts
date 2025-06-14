  import { prisma } from '@/lib/prisma';
  import { NextResponse } from 'next/server';

  export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { landId, userId, message } = body;

      if (!landId || !userId || !message) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if land exists and is available
      const land = await prisma.land.findUnique({
        where: { id: landId },
        include: { plot: true }
      });

      if (!land) {
        return NextResponse.json({ error: 'Land not found' }, { status: 404 });
      }

      if (land.status !== 'AVAILABLE') {
        return NextResponse.json(
          { error: 'Land is not available for purchase' },
          { status: 400 }
        );
      }

      // Create buy request
      const buyRequest = await prisma.buyRequest.create({
        data: {
          landId,
          userId,
          message
        },
        include: {
          land: {
            include: {
              plot: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
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
          land: {
            include: {
              plot: true
            }
          },
          user: {
            select: {
              id: true,
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

      return NextResponse.json(buyRequests);
    } catch (error) {
      console.error('Error fetching buy requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch buy requests' },
        { status: 500 }
      );
    }
  }

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
          land: {
            include: {
              plot: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
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
