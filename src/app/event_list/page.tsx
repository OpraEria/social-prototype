import React from "react";
import Link from "next/link";
import { Client } from "pg";

import RouteButton from "@/components/common/RouteButton";

type EventRow = {
  id: number | string;
  title: string;
  description?: string | null;
  start_time?: Date | string | null;
};

async function fetchEvents(): Promise<{ events: EventRow[]; error?: string }> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("⚠️ Mangler DATABASE_URL i miljøvariablene");
    return { events: [], error: "Mangler databasekonfigurasjon" };
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT id, title, description, start_time
       FROM events
       ORDER BY start_time DESC
       LIMIT 200`
    );

    const events = res.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      start_time: r.start_time,
    }));

    return { events };
  } catch (err: any) {
    console.error("❌ Feil ved henting av events:", err);
    return { events: [], error: "Får ikke kontakt med databasen" };
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

function formatDate(d?: string | Date | null) {
  if (!d) return "Ukjent dato";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Page() {
  const { events, error } = await fetchEvents();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 16 }}>Events</h1>

      {/* Feilmelding fra databasen */}
      {error ? (
        <p style={{ color: "red", fontWeight: 500 }}>{error}</p>
      ) : events.length === 0 ? (
        <p>Ingen events funnet.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {events.map((ev) => (
            <li
              key={String(ev.id)}
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 8,
                padding: 12,
                transition: "box-shadow 0.15s",
              }}
            >
              <Link
                href={`/event/${ev.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h2 style={{ margin: 0, fontSize: 18 }}>{ev.title}</h2>
                  <time style={{ color: "#666", fontSize: 13 }}>
                    {formatDate(ev.start_time)}
                  </time>
                </div>
                {ev.description ? (
                  <p style={{ marginTop: 8, color: "#333" }}>
                    {ev.description.length > 200
                      ? ev.description.slice(0, 200) + "…"
                      : ev.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div>
        <RouteButton label="Gå tilbake til users" to="/" />
      </div>
    </main>
  );
}
