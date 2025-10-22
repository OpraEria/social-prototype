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
    const result = await pool.query("SELECT * FROM Bruker");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
