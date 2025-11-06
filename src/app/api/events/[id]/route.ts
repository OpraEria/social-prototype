import pool from "../../../../../db.js";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and in gruppe_id = 1
    if (!session?.user?.gruppeId || session.user.gruppeId !== 1) {
      return NextResponse.json(
        { error: 'Unauthorized - Only gruppe 1 can delete events' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await pool.query(
      "DELETE FROM arrangement WHERE event_id = $1 RETURNING event_id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully', event_id: id });
  } catch (err: any) {
    console.error("Failed to delete event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
