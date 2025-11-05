import pool from "../../../../db.js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT event_id, tittel, beskrivelse, lokasjon, tid, host_id
       FROM arrangement
       ORDER BY tid DESC
       LIMIT 200`
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
    const { tittel, beskrivelse, lokasjon, tid, host_id } = body;

    if (!tittel || !beskrivelse || !lokasjon || !tid || !host_id) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: tittel, beskrivelse, lokasjon, tid, host_id",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO arrangement (tittel, beskrivelse, lokasjon, tid, host_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tittel, beskrivelse, lokasjon, tid, host_id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("Failed to add user:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
