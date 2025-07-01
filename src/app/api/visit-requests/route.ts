import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
// GET - Fetch all visit requests or filter by user, manager, or clerkId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const managerId = searchParams.get('managerId');
    const clerkId = searchParams.get('clerkId');

    let whereClause: any = {};
    if (clerkId) {
      whereClause = {
        OR: [{ user: { clerkId } }, { assignedManager: { clerkId } }]
      };
    } else {
      if (userId) whereClause.userId = userId;
      if (managerId) {
        whereClause.assignedManager = {
          clerkId: managerId
        };
      }
    }

    const visitRequests = await prisma.visitRequest.findMany({
      where: whereClause,
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

    // Transform the data to include QR codes for approved requests
    const transformedData = await Promise.all(
      visitRequests.map(async (request) => {
        let qrCode = null;
        if (request.status === 'APPROVED' && request.qrCode) {
          qrCode = request.qrCode;
        } else if (request.status === 'APPROVED') {
          const qrData = JSON.stringify({
            id: request.id,
            name: request.name,
            email: request.email,
            phone: request.phone,
            date: request.date.toISOString(),
            time: request.time,
            plotId: request.plotId,
            plotTitle: request.plot.title,
            projectName: request.plot.project.name
          });
          qrCode = await QRCode.toDataURL(qrData);
        }

        return {
          id: request.id,
          status: request.status,
          date: request.date.toISOString(),
          time: request.time,
          name: request.name,
          email: request.email,
          phone: request.phone,
          qrCode,
          expiresAt: request.expiresAt?.toISOString() || null,
          plot: request.plot,
          user: request.user,
          assignedManager: request.assignedManager,
          createdAt: request.createdAt.toISOString(),
          updatedAt: request.updatedAt.toISOString()
        };
      })
    );

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching visit requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visit requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new visit request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, plotId, userId } = body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !plotId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const visitDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDate < today) {
      return NextResponse.json(
        { error: 'Visit date cannot be in the past' },
        { status: 400 }
      );
    }

    // Check if plot exists
    const plot = await prisma.plot.findUnique({
      where: { id: plotId }
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    // Check for existing pending request
    const existingRequest = await prisma.visitRequest.findFirst({
      where: {
        OR: [{ userId: userId || undefined }, { email }],
        plotId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending visit request for this plot' },
        { status: 409 }
      );
    }

    // Create visit request
    const visitRequest = await prisma.visitRequest.create({
      data: {
        name,
        email,
        phone,
        date: visitDate,
        time,
        plotId,
        userId,
        status: 'PENDING'
      },
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

    return NextResponse.json(visitRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating visit request:', error);
    return NextResponse.json(
      { error: 'Failed to create visit request' },
      { status: 500 }
    );
  }
}

// PATCH - Update visit request status (approve/reject) and assign manager
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, managerId } = body;

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
      const qrData = JSON.stringify({
        id: visitRequest.id,
        name: visitRequest.name,
        date: visitRequest.date,
        time: visitRequest.time,
        plotId: visitRequest.plotId
      });
      qrCode = await QRCode.toDataURL(qrData);
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
