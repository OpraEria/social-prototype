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

    const userId = parseInt(session.user.id);

    // Remove subscription from database
    await pool.query(
      'DELETE FROM push_subscriptions WHERE bruker_id = $1',
      [userId]
    );

    return NextResponse.json({ 
      message: 'Successfully unsubscribed from notifications',
      success: true
    });
  } catch (err: any) {
    console.error("Failed to unsubscribe from notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
