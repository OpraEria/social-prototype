import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from "../../../../../db.js";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscription } = await req.json();
    const userId = parseInt(session.user.id);

    // Store subscription in database
    await pool.query(
      `INSERT INTO push_subscriptions (bruker_id, subscription_data, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (bruker_id) 
       DO UPDATE SET subscription_data = $2, created_at = NOW()`,
      [userId, JSON.stringify(subscription)]
    );

    return NextResponse.json({ 
      message: 'Successfully subscribed to notifications',
      success: true
    });
  } catch (err: any) {
    console.error("Failed to subscribe to notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
