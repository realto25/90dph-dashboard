import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define the route handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they are wrapped in a Promise in Next.js App Router
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        ownedPlots: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
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
          select: {
            id: true,
            number: true,
            size: true,
            status: true,
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
