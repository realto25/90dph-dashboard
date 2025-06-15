import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received');

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  console.log('📝 Webhook headers:', {
    svix_id,
    svix_timestamp,
    has_signature: !!svix_signature
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing svix headers:', {
      svix_id,
      svix_timestamp,
      svix_signature
    });
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  console.log('📦 Webhook payload type:', payload.type);
  console.log(
    '📦 Webhook payload data:',
    JSON.stringify(payload.data, null, 2)
  );

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    });
    console.log('✅ Webhook verification successful');
  } catch (err) {
    console.error('❌ Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  const { type, data } = evt;
  console.log('🔄 Processing webhook event:', type);

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          public_metadata,
          phone_numbers
        } = data;
        const primaryEmail = email_addresses?.find(
          (email: any) => email.id === data.primary_email_address_id
        );
        const primaryPhone = phone_numbers?.find(
          (phone: any) => phone.id === data.primary_phone_number_id
        );

        console.log('👤 User data:', {
          id,
          email: primaryEmail?.email_address,
          name: `${first_name} ${last_name}`,
          phone: primaryPhone?.phone_number,
          role: public_metadata?.role
        });

        if (!id) {
          console.error('❌ Missing user ID in webhook data');
          return NextResponse.json(
            { error: 'Invalid user data - missing ID' },
            { status: 400 }
          );
        }

        const userData = {
          clerkId: id,
          email:
            primaryEmail?.email_address || email_addresses?.[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown',
          phone: primaryPhone?.phone_number || phone_numbers?.[0]?.phone_number,
          role: (public_metadata?.role as UserRole) || UserRole.GUEST
        };

        if (!userData.email) {
          console.error('❌ Missing email in webhook data:', data);
          return NextResponse.json(
            { error: 'Invalid user data - missing email' },
            { status: 400 }
          );
        }

        console.log('💾 Saving user data:', userData);

        const user = await prisma.user.upsert({
          where: { clerkId: id },
          update: userData,
          create: userData
        });

        console.log('✅ User synced successfully:', user.id);
        return NextResponse.json(
          { message: 'User synced successfully', userId: user.id },
          { status: 200 }
        );
      }

      case 'user.deleted': {
        const { id } = data;
        if (!id) {
          console.error('❌ Missing user ID in delete event');
          return NextResponse.json(
            { error: 'Invalid user data - missing ID' },
            { status: 400 }
          );
        }

        console.log('🗑️ Deleting user:', id);

        await prisma.user.delete({
          where: { clerkId: id }
        });

        console.log('✅ User deleted successfully:', id);
        return NextResponse.json(
          { message: 'User deleted successfully' },
          { status: 200 }
        );
      }

      default:
        console.log('⚠️ Unhandled webhook event type:', type);
        return NextResponse.json(
          { message: 'Webhook received but not handled' },
          { status: 200 }
        );
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
