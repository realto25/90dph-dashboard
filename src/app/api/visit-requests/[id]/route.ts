import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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
