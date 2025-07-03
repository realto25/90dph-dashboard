import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');

    if (clerkId) {
      // Fetch cameras for a specific user
      const user = (await prisma.user.findUnique({
        where: { clerkId },
        include: {
          ownedPlots: {
            include: {
              cameras: true,
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
              cameras: true,
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
      })) as any;

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // Format the response to include both plot and land cameras
      const cameras = [
        ...user.ownedPlots.flatMap((plot: any) =>
          (plot.cameras || []).map((camera: any) => ({
            id: camera.id,
            type: 'plot',
            title: plot.title,
            location: plot.location,
            ipAddress: camera.ipAddress,
            label: camera.label,
            project: plot.project
          }))
        ),
        ...user.ownedLands.flatMap((land: any) =>
          (land.cameras || []).map((camera: any) => ({
            id: camera.id,
            type: 'land',
            title: land.plot.title,
            location: land.plot.location,
            size: land.size,
            number: land.number,
            ipAddress: camera.ipAddress,
            label: camera.label,
            project: land.plot.project
          }))
        )
      ];
      return NextResponse.json(cameras);
    } else {
      // Fetch all users with their plots and lands
      const users = (await prisma.user.findMany({
        include: {
          ownedPlots: {
            include: {
              cameras: true,
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
              cameras: true,
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
      })) as any[];

      // Aggregate all cameras from all users
      const cameras = users.flatMap((user: any) => [
        ...user.ownedPlots.flatMap((plot: any) =>
          (plot.cameras || []).map((camera: any) => ({
            id: camera.id,
            type: 'plot',
            title: plot.title,
            location: plot.location,
            ipAddress: camera.ipAddress,
            label: camera.label,
            project: plot.project
          }))
        ),
        ...user.ownedLands.flatMap((land: any) =>
          (land.cameras || []).map((camera: any) => ({
            id: camera.id,
            type: 'land',
            title: land.plot.title,
            location: land.plot.location,
            size: land.size,
            number: land.number,
            ipAddress: camera.ipAddress,
            label: camera.label,
            project: land.plot.project
          }))
        )
      ]);
      return NextResponse.json(cameras);
    }
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
