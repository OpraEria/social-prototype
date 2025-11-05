import React from "react";
import Link from "next/link";
import RouteButton from "@/components/common/RouteButton";
import { query } from "@/lib/db";

type EventRow = {
  event_id: number | string;
  tittel: string;
  beskrivelse?: string | null;
  lokasjon?: string | null;
  tid?: Date | string | null;
  host_id?: number;
};

async function fetchEvents(): Promise<{ events: EventRow[]; error?: string }> {
  try {
    // Fetch directly from database in server component
    const result = await query(
      `SELECT event_id, tittel, beskrivelse, lokasjon, tid, host_id
       FROM arrangement
       ORDER BY tid DESC
       LIMIT 200`
    );

    return { events: result.rows };
  } catch (err: any) {
    console.error("❌ Klarte ikke hente events:", err);
    return { events: [], error: "Får ikke kontakt med serveren" };
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
              key={String(ev.event_id)}
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 8,
                padding: 12,
                transition: "box-shadow 0.15s",
              }}
            >
              <Link
                href={`/event/${ev.event_id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h2 style={{ margin: 0, fontSize: 18 }}>{ev.tittel}</h2>
                  <time style={{ color: "#666", fontSize: 13 }}>
                    {formatDate(ev.tid)}
                  </time>
                </div>
                {ev.lokasjon && (
                  <p style={{ marginTop: 4, color: "#666", fontSize: 14 }}>
                    📍 {ev.lokasjon}
                  </p>
                )}
                {ev.beskrivelse ? (
                  <p style={{ marginTop: 8, color: "#333" }}>
                    {ev.beskrivelse.length > 200
                      ? ev.beskrivelse.slice(0, 200) + "…"
                      : ev.beskrivelse}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <RouteButton label="Opprett nytt event" to="/eventcreation" />
        <RouteButton label="Gå tilbake" to="/" />
      </div>
    </main>
  );
}
