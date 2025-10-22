/*

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {}
export async function PUT(req: Request) {}
export async function DELETE(req: Request) {}
*/

import pool from "../../../../db.js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM bruker");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { navn, gruppe_id } = body;

    if (!navn || !gruppe_id) {
      return NextResponse.json(
        { error: "Missing required fields: navn, gruppe_id" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO bruker (navn, gruppe_id) VALUES ($1, $2) RETURNING *",
      [navn, gruppe_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("Failed to add user:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
