import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all lands with status 'SOLD', owner role CLIENT, and include plot
    const assignedLands = await prisma.land.findMany({
      where: {
        status: 'SOLD',
        owner: {
          role: 'CLIENT'
        }
      },
      select: {
        id: true,
        number: true,
        size: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        plot: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map to API response format
    const result = assignedLands.map((land) => ({
      id: land.id,
      landNumber: land.number,
      landSize: land.size,
      assignedAt: land.createdAt,
      clientName: land.owner?.name || 'Unknown',
      clientEmail: land.owner?.email || 'Unknown',
      plotTitle: land.plot?.title || 'Unknown'
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ASSIGNED_LANDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
