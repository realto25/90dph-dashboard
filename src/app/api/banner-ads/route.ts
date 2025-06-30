import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const bannerAds = await prisma.bannerAd.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bannerAds);
  } catch (error) {
    console.error('Error fetching banner ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner ads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, imageUrl } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    const bannerAd = await prisma.bannerAd.create({
      data: {
        title,
        description,
        imageUrl,
        isActive: true
      }
    });

    return NextResponse.json(bannerAd, { status: 201 });
  } catch (error) {
    console.error('Error creating banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to create banner ad' },
      { status: 500 }
    );
  }
}
