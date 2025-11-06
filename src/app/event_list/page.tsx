import React from "react";
import Link from "next/link";
import { query } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Plus } from "lucide-react";

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
      `SELECT event_id, tittel, beskrivelse, tid, host_id, breddegrad as latitude, lengdegrad as longitude
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Events</h1>
          <p className="text-muted-foreground">Oppdag spennende arrangementer</p>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Ingen events funnet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 mb-8">
            {events.map((ev) => (
              <Link
                key={String(ev.event_id)}
                href={`/event/${ev.event_id}`}
                className="block transition-transform hover:scale-[1.02]"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-xl">{ev.tittel}</CardTitle>
                      <time className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(ev.tid)}
                      </time>
                    </div>
                    {ev.lokasjon && (
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <MapPin className="h-4 w-4" />
                        {ev.lokasjon}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {ev.beskrivelse && (
                    <CardContent className="pt-4">
                      <p className="text-gray-700 line-clamp-2">
                        {ev.beskrivelse.length > 200
                          ? ev.beskrivelse.slice(0, 200) + "…"
                          : ev.beskrivelse}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/eventcreation">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Opprett nytt event
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Gå tilbake
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
