// src/app/api/sell-requests/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Types for the request body
interface CreateSellRequestBody {
  landId: string; // Changed from plotId to landId since frontend works with lands
  clerkId: string;
  askingPrice: number; // Changed to number since frontend sends parseFloat
  reason?: string;
  urgency?: 'LOW' | 'NORMAL' | 'HIGH';
  agentAssistance?: boolean;
  documents?: string[];
  termsAccepted: boolean;
}

// GET - Fetch all sell requests for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Clerk ID is required' },
        { status: 400 }
      );
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sellRequests = await prisma.sellRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        plot: {
          select: {
            id: true,
            title: true,
            location: true,
            dimension: true,
            price: true,
            imageUrls: true,
            totalArea: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true
          }
        }
      }
    });

    return NextResponse.json(sellRequests);
  } catch (error) {
    console.error('Error fetching sell requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sell requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new sell request
export async function POST(request: NextRequest) {
  try {
    const body: CreateSellRequestBody = await request.json();
    const {
      landId,
      clerkId,
      askingPrice,
      reason,
      urgency = 'NORMAL',
      agentAssistance = false,
      documents = [],
      termsAccepted
    } = body;

    console.log('Received sell request data:', body);

    // Validate required fields
    if (!landId || !clerkId) {
      return NextResponse.json(
        { error: 'Land ID and Clerk ID are required' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Terms and conditions must be accepted' },
        { status: 400 }
      );
    }

    if (!askingPrice || askingPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid asking price is required' },
        { status: 400 }
      );
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the land and verify ownership
    const land = await prisma.land.findFirst({
      where: {
        id: landId,
        ownerId: user.id
      },
      include: {
        plot: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!land) {
      // Check if land exists but not owned by user
      const landExists = await prisma.land.findUnique({
        where: { id: landId }
      });

      if (!landExists) {
        return NextResponse.json({ error: 'Land not found' }, { status: 404 });
      } else {
        return NextResponse.json(
          { error: 'You do not own this land' },
          { status: 403 }
        );
      }
    }

    // Check for existing pending request for this land
    const existingRequest = await prisma.sellRequest.findFirst({
      where: {
        plotId: land.plot.id, // SellRequest is linked to Plot, not Land directly
        userId: user.id,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending sell request for this property' },
        { status: 409 }
      );
    }

    // Calculate potential profit/loss based on land price vs asking price
    const landPrice = land.price;
    const potentialProfit = askingPrice - landPrice;
    const profitPercentage = ((potentialProfit / landPrice) * 100);

    // Create sell request
    const sellRequest = await prisma.sellRequest.create({
      data: {
        plotId: land.plot.id, // Link to the plot that contains this land
        userId: user.id,
        askingPrice: askingPrice,
        reason: reason?.trim() || 'No reason provided',
        urgency,
        agentAssistance,
        documents: documents.length > 0 ? documents : [],
        termsAccepted,
        status: 'PENDING',
        potentialProfit,
        profitPercentage
      },
      include: {
        plot: {
          select: {
            id: true,
            title: true,
            location: true,
            dimension: true,
            price: true,
            imageUrls: true,
            totalArea: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true
          }
        }
      }
    });

    console.log('Sell request created successfully:', sellRequest.id);

    return NextResponse.json({
      success: true,
      data: sellRequest
    });

  } catch (error) {
    console.error('Error creating sell request:', error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid land or user reference' },
          { status: 400 }
        );
      }

      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'Duplicate sell request' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create sell request' },
      { status: 500 }
    );
  }
}

// PATCH - Update sell request status (for admin use)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Sell request ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedSellRequest = await prisma.sellRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
        ...(status === 'APPROVED' && { approvedAt: new Date() }),
        ...(status === 'REJECTED' && { rejectedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      },
      include: {
        plot: {
          select: {
            id: true,
            title: true,
            location: true,
            dimension: true,
            price: true,
            imageUrls: true,
            totalArea: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true
          }
        }
      }
    });

    return NextResponse.json(updatedSellRequest);
  } catch (error) {
    console.error('Error updating sell request:', error);

    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      return NextResponse.json(
        { error: 'Sell request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sell request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a sell request (for user cancellation)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clerkId = searchParams.get('clerkId');

    if (!id || !clerkId) {
      return NextResponse.json(
        { error: 'Sell request ID and Clerk ID are required' },
        { status: 400 }
      );
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the sell request exists and belongs to the user
    const sellRequest = await prisma.sellRequest.findFirst({
      where: {
        id,
        userId: user.id,
        status: 'PENDING' // Only allow deletion of pending requests
      }
    });

    if (!sellRequest) {
      return NextResponse.json(
        { error: 'Sell request not found or cannot be deleted' },
        { status: 404 }
      );
    }

    // Delete the sell request
    await prisma.sellRequest.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Sell request deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting sell request:', error);
    return NextResponse.json(
      { error: 'Failed to delete sell request' },
      { status: 500 }
    );
  }
}