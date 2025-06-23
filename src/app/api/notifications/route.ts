import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, title, userId, targetRole } = await req.json();
    if (!message || (!userId && !targetRole)) {
      return NextResponse.json(
        { error: 'Message and userId or targetRole are required.' },
        { status: 400 }
      );
    }

    let notifications: any[] = [];
    if (userId) {
      // Send to a specific user
      const notification = await prisma.notification.create({
        data: { message, title, userId }
      });
      notifications.push(notification);
    } else if (targetRole) {
      // Send to all users with the given role
      const users = await prisma.user.findMany({ where: { role: targetRole } });
      notifications = await prisma.$transaction(
        users.map((user) =>
          prisma.notification.create({
            data: { message, title, userId: user.id, targetRole }
          })
        )
      );
    }
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, message, title } = await req.json();
    if (!id || !message) {
      return NextResponse.json(
        { error: 'ID and message are required.' },
        { status: 400 }
      );
    }
    const notification = await prisma.notification.update({
      where: { id },
      data: { message, title }
    });
    return NextResponse.json({ notification });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
