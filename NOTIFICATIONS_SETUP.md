# Push Notifications Setup Guide

## Overview
This guide explains how to set up push notifications for your PWA using Web Push and the existing VAPID keys.

## Database Setup

You need to create the `push_subscriptions` table in your Azure PostgreSQL database. Run this SQL as a database administrator:

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    bruker_id INT PRIMARY KEY REFERENCES bruker(bruker_id) ON DELETE CASCADE,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

The following environment variables are already set in `.env.local`:

- `VAPIDPUBLICKEY` - Public VAPID key for web push (server-side)
- `VAPIDPRIVATEKEY` - Private VAPID key for web push (server-side)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Public VAPID key exposed to client

## How It Works

### 1. User Subscription Flow
When a user logs in for the first time:
1. They are prompted to enable notifications
2. If they accept, the service worker is registered (`/custom-sw.js`)
3. A push subscription is created using the VAPID public key
4. The subscription is saved to the database via `/api/notifications/subscribe`

### 2. Sending Notifications
When a new event is created:
1. The event is saved to the database
2. The system finds all users in the same `gruppe_id`
3. Push notifications are sent to all subscribed users via `/api/notifications/send`
4. Each user receives a native notification on their device

### 3. Notification Handling
- When a notification is received, it's displayed by the service worker
- Clicking the notification opens the event detail page
- Notifications are automatically grouped by tag to prevent spam

## API Endpoints

### Subscribe to Notifications
`POST /api/notifications/subscribe`
- Requires authentication
- Stores push subscription in database
- Body: `{ subscription: PushSubscription }`

### Unsubscribe from Notifications
`POST /api/notifications/unsubscribe`
- Requires authentication
- Removes push subscription from database

### Send Notifications
`POST /api/notifications/send`
- Requires authentication
- Sends push notifications to all users in the same group
- Body: `{ title: string, body: string, eventId?: string }`
- Automatically called when creating new events

## Files Created/Modified

### New Files
- `/src/lib/notifications.ts` - Notification utility functions
- `/src/app/api/notifications/subscribe/route.ts` - Subscribe endpoint
- `/src/app/api/notifications/unsubscribe/route.ts` - Unsubscribe endpoint
- `/src/app/api/notifications/send/route.ts` - Send notifications endpoint
- `/public/custom-sw.js` - Service worker with push notification support
- `/migrations/create_push_subscriptions_table.sql` - Database migration

### Modified Files
- `/src/app/api/events/route.ts` - Added notification trigger on event creation
- `/src/app/page.tsx` - Added notification subscription on user login
- `/.env.local` - Added `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

## Testing Notifications

### 1. Enable Notifications
1. Log in to the app
2. Accept the notification permission prompt
3. Check browser DevTools > Application > Service Workers to verify registration

### 2. Create an Event
1. Create a new event as one user
2. Check that other users in the same group receive a push notification
3. Click the notification to navigate to the event

### 3. Debug
- Open DevTools > Application > Service Workers
- Check Console for any errors
- Verify subscription in DevTools > Application > Push Messaging

## Browser Support

Push notifications are supported in:
- Chrome/Edge (Desktop & Android)
- Firefox (Desktop & Android)
- Safari (macOS 16.4+, iOS 16.4+)

## Security Notes

- VAPID keys are already generated and configured
- Subscriptions are user-specific and stored securely
- Notifications only sent to users in the same group
- Service worker requires HTTPS in production

## Troubleshooting

### Notifications not appearing
1. Check browser notification permissions
2. Verify service worker is registered
3. Check DevTools console for errors
4. Ensure database table is created

### Permission denied errors
1. User must grant notification permission
2. Site must be served over HTTPS (or localhost)
3. Check browser notification settings

### Subscription failures
1. Verify VAPID keys are correctly set
2. Check service worker registration
3. Ensure `/custom-sw.js` is accessible

## Next Steps

1. **Run the database migration** (requires admin access to Azure PostgreSQL)
2. **Test on localhost** - notifications work on localhost without SSL
3. **Deploy to production** - requires HTTPS for service workers
4. **Customize notification content** - edit `/src/app/api/notifications/send/route.ts`
