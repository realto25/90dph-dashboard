import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all users with their related data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true,
        // Include related data
        ownedPlots: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        clientPlots: {
          select: {
            id: true,
            plot: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        },
        visitRequests: {
          select: {
            id: true,
            status: true,
            date: true
          }
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            createdAt: true
          }
        },
        sentMessages: {
          select: {
            id: true,
            content: true,
            isRead: true,
            createdAt: true
          }
        },
        receivedMessages: {
          select: {
            id: true,
            content: true,
            isRead: true,
            createdAt: true
          }
        },
        sellRequests: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return the users data
    return NextResponse.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);

    // Return a proper error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
