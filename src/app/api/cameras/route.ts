import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json(
        { message: 'Clerk ID is required' },
        { status: 400 }
      );
    }

    // First get the user from the clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        ownedPlots: {
          include: {
            camera: true,
            project: {
              select: {
                name: true,
                location: true
              }
            }
          }
        },
        ownedLands: {
          include: {
            camera: true,
            plot: {
              select: {
                title: true,
                location: true,
                project: {
                  select: {
                    name: true,
                    location: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Format the response to include both plot and land cameras
    const cameras = [
      ...user.ownedPlots
        .filter((plot) => plot.camera)
        .map((plot) => ({
          id: plot.camera!.id,
          type: 'plot',
          title: plot.title,
          location: plot.location,
          ipAddress: plot.camera!.ipAddress,
          label: plot.camera!.label,
          project: plot.project
        })),
      ...user.ownedLands
        .filter((land) => land.camera)
        .map((land) => ({
          id: land.camera!.id,
          type: 'land',
          title: land.plot.title,
          location: land.plot.location,
          size: land.size,
          number: land.number,
          ipAddress: land.camera!.ipAddress,
          label: land.camera!.label,
          project: land.plot.project
        }))
    ];

    return NextResponse.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
