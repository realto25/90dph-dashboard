import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { landId, cameras } = await req.json();

    if (!landId || !Array.isArray(cameras) || cameras.length === 0) {
      return NextResponse.json(
        { message: 'Land ID and at least one camera are required' },
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

    // Create multiple cameras
    const createdCameras = await prisma.$transaction(
      cameras.map((cam: { ipAddress: string; label?: string }) =>
        prisma.landCamera.create({
          data: {
            landId,
            ipAddress: cam.ipAddress,
            label: cam.label || null
          }
        })
      )
    );

    return NextResponse.json(createdCameras);
  } catch (error) {
    console.error('Error assigning cameras to land:', error);
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
        cameras: true,
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
    await prisma.landCamera.delete({ where: { id } });
    return NextResponse.json({ message: 'Camera deleted' });
  } catch (error) {
    console.error('Error deleting land camera:', error);
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
    const updated = await prisma.landCamera.update({
      where: { id },
      data: { ipAddress, label: label || null }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating land camera:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
