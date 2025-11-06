import pool from "../../../../../../db.js";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(session.user.id);
    const eventId = parseInt(id);

    // Check if user is already participating
    const checkResult = await pool.query(
      "SELECT * FROM deltakelse WHERE event_id = $1 AND bruker_id = $2",
      [eventId, userId]
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'You are already participating in this event' },
        { status: 400 }
      );
    }

    // Add user to event
    await pool.query(
      "INSERT INTO deltakelse (event_id, bruker_id) VALUES ($1, $2)",
      [eventId, userId]
    );

    return NextResponse.json({ 
      message: 'Successfully joined event',
      event_id: eventId,
      bruker_id: userId
    });
  } catch (err: any) {
    console.error("Failed to join event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(session.user.id);
    const eventId = parseInt(id);

    // Remove user from event
    const result = await pool.query(
      "DELETE FROM deltakelse WHERE event_id = $1 AND bruker_id = $2 RETURNING *",
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'You are not participating in this event' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Successfully left event',
      event_id: eventId,
      bruker_id: userId
    });
  } catch (err: any) {
    console.error("Failed to leave event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
