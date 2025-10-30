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
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM bruker");
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ 
      error: "Failed to connect to database. Please check your database configuration." 
    }, { status: 500 });
  }
}

// POST: Add a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { navn, passord, gruppe_id } = body;

    if (!navn || !gruppe_id) {
      return NextResponse.json(
        { error: "Missing required fields: navn, gruppe_id" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO bruker (navn, passord, gruppe_id) VALUES ($1, $2, $3) RETURNING *",
      [navn, passord, gruppe_id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("Failed to add user:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
