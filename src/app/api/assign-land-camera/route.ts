import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { landId, ipAddress, label } = await req.json();

    if (!landId || !ipAddress) {
      return NextResponse.json(
        { message: 'Land ID and IP Address are required' },
        { status: 400 }
      );
    }

    // Check if land exists and has an owner
    const land = await prisma.land.findUnique({
      where: { id: landId },
      include: { owner: true }
    });

    if (!land) {
      return NextResponse.json({ message: 'Land not found' }, { status: 404 });
    }

    if (!land.ownerId) {
      return NextResponse.json(
        { message: 'Land must be assigned to an owner first' },
        { status: 400 }
      );
    }

    // Create or update camera
    const camera = await prisma.landCamera.upsert({
      where: { landId },
      update: {
        ipAddress,
        label: label || null
      },
      create: {
        landId,
        ipAddress,
        label: label || null
      }
    });

    return NextResponse.json(camera);
  } catch (error) {
    console.error('Error assigning camera to land:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json(
        { message: 'Owner ID is required' },
        { status: 400 }
      );
    }

    const lands = await prisma.land.findMany({
      where: {
        ownerId,
        status: 'SOLD'
      },
      include: {
        camera: true,
        plot: {
          select: {
            title: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(lands);
  } catch (error) {
    console.error('Error fetching lands with cameras:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
