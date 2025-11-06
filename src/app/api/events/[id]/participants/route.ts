import pool from "../../../../../../db.js";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT b.bruker_id, b.navn 
       FROM deltakelse d
       JOIN bruker b ON d.bruker_id = b.bruker_id
       WHERE d.event_id = $1
       ORDER BY b.navn`,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Failed to fetch participants:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
