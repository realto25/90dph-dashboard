import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    // Try to delete the land
    const deleted = await prisma.land.delete({
      where: { id }
    });
    if (!deleted) {
      return new NextResponse('Land not found', { status: 404 });
    }
    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error('[ASSIGNED_LAND_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
