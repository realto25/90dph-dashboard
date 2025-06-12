import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  const { type, data } = evt;

  if (type === 'user.created' || type === 'user.updated') {
    try {
      const { id, email_addresses, first_name, last_name, public_metadata } =
        data;
      const email = email_addresses[0]?.email_address;
      if (!email || !id) {
        return NextResponse.json(
          { error: 'Invalid user data' },
          { status: 400 }
        );
      }

      const userData = {
        clerkId: id,
        email,
        name: `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown',
        role: public_metadata?.role || 'GUEST'
      };

      await prisma.user.upsert({
        where: { clerkId: id },
        update: userData,
        create: userData
      });

      return NextResponse.json(
        { message: 'User synced successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error syncing user:', error);
      return NextResponse.json(
        { error: 'Failed to sync user' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: 'Webhook received' });
}
