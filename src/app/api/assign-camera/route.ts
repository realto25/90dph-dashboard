import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plotId, ipAddress, label } = await req.json();

    if (!plotId || !ipAddress) {
      return NextResponse.json(
        { message: 'Plot ID and IP Address are required' },
        { status: 400 }
      );
    }

    // Check if plot exists and has an owner
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: { owner: true }
    });

    if (!plot) {
      return NextResponse.json({ message: 'Plot not found' }, { status: 404 });
    }

    if (!plot.ownerId) {
      return NextResponse.json(
        { message: 'Plot must be assigned to an owner first' },
        { status: 400 }
      );
    }

    // Create or update camera
    const camera = await prisma.camera.upsert({
      where: { plotId },
      update: {
        ipAddress,
        label: label || null
      },
      create: {
        plotId,
        ipAddress,
        label: label || null
      }
    });

    return NextResponse.json(camera);
  } catch (error) {
    console.error('Error assigning camera:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
