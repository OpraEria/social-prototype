import pool from "../../../../db.js";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.gruppeId) {
      return NextResponse.json(
        { error: 'Unauthorized or no group assigned' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT a.event_id, a.tittel, a.beskrivelse, a.tid, a.host_id, 
              a.breddegrad as latitude, a.lengdegrad as longitude
       FROM arrangement a
       JOIN bruker b ON a.host_id = b.bruker_id
       WHERE b.gruppe_id = $1
       ORDER BY a.tid DESC
       LIMIT 200`,
      [session.user.gruppeId]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching events:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tittel, beskrivelse, lokasjon, tid, host_id, latitude, longitude } = body;

    if (!tittel || !beskrivelse || !tid || !host_id) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: tittel, beskrivelse, tid, host_id",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO arrangement (tittel, beskrivelse, tid, host_id, breddegrad, lengdegrad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING event_id, tittel, beskrivelse, tid, host_id, breddegrad as latitude, lengdegrad as longitude",
      [tittel, beskrivelse, tid, host_id, latitude || null, longitude || null]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("Failed to add event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
