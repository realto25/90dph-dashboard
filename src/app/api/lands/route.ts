import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plotId = searchParams.get('plotId');

    if (!plotId) {
      return NextResponse.json(
        { error: 'Plot ID is required' },
        { status: 400 }
      );
    }

    const lands = await prisma.land.findMany({
      where: {
        plotId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(lands);
  } catch (error) {
    console.error('Error fetching lands:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { number, size, price, status, imageUrl, plotId } = body;

    // Log the received data for debugging
    console.log('Received land data:', body);

    // Validate required fields with proper type checking
    if (!number || typeof number !== 'string') {
      return NextResponse.json(
        { error: 'Valid land number is required' },
        { status: 400 }
      );
    }

    if (!size || typeof size !== 'string') {
      return NextResponse.json(
        { error: 'Valid land size is required' },
        { status: 400 }
      );
    }

    if (!price || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }

    if (!status || !['AVAILABLE', 'ADVANCE', 'SOLD'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    if (!plotId || typeof plotId !== 'string') {
      return NextResponse.json(
        { error: 'Valid plot ID is required' },
        { status: 400 }
      );
    }

    // Create the land record
    const land = await prisma.land.create({
      data: {
        number,
        size,
        price,
        status,
        imageUrl,
        plotId
      }
    });

    return NextResponse.json(land);
  } catch (error) {
    console.error('Error creating land:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { number, size, price, status, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Land ID is required' },
        { status: 400 }
      );
    }

    const updatedLand = await prisma.land.update({
      where: { id },
      data: {
        number,
        size,
        price,
        status,
        imageUrl
      }
    });

    return NextResponse.json(updatedLand);
  } catch (error) {
    console.error('Error updating land:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Land ID is required' },
        { status: 400 }
      );
    }

    await prisma.land.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Land deleted successfully' });
  } catch (error) {
    console.error('Error deleting land:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
