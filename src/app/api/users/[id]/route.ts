import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the route handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Explicitly type params as a Promise
) {
  try {
    // Await the params since they are wrapped in a Promise in Next.js App Router
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { clerkId: id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
