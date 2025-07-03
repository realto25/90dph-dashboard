import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plotId, cameras } = await req.json();

    if (!plotId || !Array.isArray(cameras) || cameras.length === 0) {
      return NextResponse.json(
        { message: 'Plot ID and at least one camera are required' },
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

    // Create multiple cameras
    const createdCameras = await prisma.$transaction(
      cameras.map((cam: { ipAddress: string; label?: string }) =>
        prisma.camera.create({
          data: {
            plotId,
            ipAddress: cam.ipAddress,
            label: cam.label || null
          }
        })
      )
    );

    return NextResponse.json(createdCameras);
  } catch (error) {
    console.error('Error assigning cameras:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { message: 'Camera ID is required' },
        { status: 400 }
      );
    }
    await prisma.camera.delete({ where: { id } });
    return NextResponse.json({ message: 'Camera deleted' });
  } catch (error) {
    console.error('Error deleting camera:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ipAddress, label } = await req.json();
    if (!id || !ipAddress) {
      return NextResponse.json(
        { message: 'Camera ID and IP Address are required' },
        { status: 400 }
      );
    }
    const updated = await prisma.camera.update({
      where: { id },
      data: { ipAddress, label: label || null }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating camera:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
