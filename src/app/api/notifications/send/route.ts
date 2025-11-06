import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from "../../../../../db.js";
import webpush from 'web-push';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPIDPUBLICKEY;
const vapidPrivateKey = process.env.VAPIDPRIVATEKEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com', // Change this to your email
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const requestBody = await req.json();
    const { title, body, eventId, userId: bodyUserId, gruppeId: bodyGruppeId } = requestBody;
    
    // Support both session-based (client) and body-based (server) authentication
    const currentUserId = bodyUserId ? parseInt(bodyUserId) : (session?.user?.id ? parseInt(session.user.id) : null);
    const gruppeId = bodyGruppeId || session?.user?.gruppeId;
    
    if (!currentUserId || !gruppeId) {
      return NextResponse.json(
        { error: 'Unauthorized or missing user/group information' },
        { status: 401 }
      );
    }

    // Get all users in the same group (excluding the current user)
    const usersResult = await pool.query(
      `SELECT DISTINCT ps.subscription_data 
       FROM push_subscriptions ps
       JOIN bruker b ON ps.bruker_id = b.bruker_id
       WHERE b.gruppe_id = $1 AND b.bruker_id != $2`,
      [gruppeId, currentUserId]
    );

    if (usersResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'No subscribers found in group',
        sent: 0
      });
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: title || 'Nytt event!',
      body: body || 'Et nytt event har blitt publisert',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      url: eventId ? `/event/${eventId}` : '/',
      eventId,
      tag: 'event-notification'
    });

    // Send notifications to all subscribers
    const sendPromises = usersResult.rows.map(async (row) => {
      try {
        // subscription_data is already a JSONB object, no need to parse
        const subscription = row.subscription_data;
        await webpush.sendNotification(subscription, notificationPayload);
        return { success: true };
      } catch (error) {
        console.error('Failed to send notification:', error);
        return { success: false, error };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    return NextResponse.json({ 
      message: `Sent ${successCount} notifications`,
      sent: successCount,
      total: usersResult.rows.length
    });
  } catch (err: any) {
    console.error("Failed to send notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
