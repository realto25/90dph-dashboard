export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { isActive } = body;

    const bannerAd = await prisma.bannerAd.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json(bannerAd);
  } catch (error) {
    console.error('Error updating banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to update banner ad' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.bannerAd.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Banner ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner ad' },
      { status: 500 }
    );
  }
}
