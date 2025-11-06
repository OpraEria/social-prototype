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
import { authOptions } from "@/lib/auth";

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

    if (!navn) {
      return NextResponse.json(
        { error: "Missing required field: navn" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // If gruppe_id is provided, check if the group exists, if not create it
      if (gruppe_id) {
        const groupCheck = await client.query(
          "SELECT gruppe_id FROM gruppe WHERE gruppe_id = $1",
          [gruppe_id]
        );
        
        if (groupCheck.rows.length === 0) {
          // Create the group if it doesn't exist (gruppe table only has gruppe_id)
          await client.query(
            "INSERT INTO gruppe (gruppe_id) VALUES ($1) ON CONFLICT (gruppe_id) DO NOTHING",
            [gruppe_id]
          );
        }
      }

      // Insert the user
      const result = await client.query(
        gruppe_id 
          ? "INSERT INTO bruker (navn, passord, gruppe_id) VALUES ($1, $2, $3) RETURNING *"
          : "INSERT INTO bruker (navn, passord) VALUES ($1, $2) RETURNING *",
        gruppe_id ? [navn, passord, gruppe_id] : [navn, passord]
      );
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Failed to add user:", err);
    return NextResponse.json({ 
      error: `Failed to add user: ${err.message}` 
    }, { status: 500 });
  }
}
