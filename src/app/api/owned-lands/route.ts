import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    if (!clerkId) {
      return new NextResponse('Missing clerkId', { status: 400 });
    }

    // Get the user's role and clerkId
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true, clerkId: true }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // If user is not a client, return error
    if (dbUser.role !== 'CLIENT') {
      return new NextResponse('Only clients can access owned lands', {
        status: 403
      });
    }

    // Fetch all lands owned by the user using clerkId
    const ownedLands = await prisma.land.findMany({
      where: {
        owner: {
          clerkId: dbUser.clerkId
        },
        status: 'SOLD'
      },
      include: {
        plot: {
          select: {
            title: true,
            dimension: true,
            price: true,
            location: true,
            imageUrls: true,
            mapEmbedUrl: true,
            qrUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(ownedLands);
  } catch (error) {
    console.error('[OWNED_LANDS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
