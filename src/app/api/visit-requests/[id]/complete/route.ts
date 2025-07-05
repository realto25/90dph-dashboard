import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'Visit request ID is required' },
      { status: 400 }
    );
  }

  try {
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id }
    });
    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Visit request not found' },
        { status: 404 }
      );
    }
    if (visitRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only APPROVED requests can be completed' },
        { status: 400 }
      );
    }

    const updated = await prisma.visitRequest.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    return NextResponse.json({ success: true, visitRequest: updated });
  } catch (error) {
    console.error('Error marking visit as completed:', error);
    return NextResponse.json(
      { error: 'Failed to mark visit as completed' },
      { status: 500 }
    );
  }
}
