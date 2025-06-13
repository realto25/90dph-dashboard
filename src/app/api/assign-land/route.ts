import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { landId, clientId } = await req.json();

    if (!landId || !clientId) {
      return NextResponse.json(
        { message: 'Land ID and Client ID are required' },
        { status: 400 }
      );
    }

    // Update the land with the new owner
    const updatedLand = await prisma.land.update({
      where: { id: landId },
      data: {
        ownerId: clientId,
        status: 'SOLD'
      },
      include: {
        owner: true
      }
    });

    return NextResponse.json(updatedLand);
  } catch (error) {
    console.error('Error assigning land:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
