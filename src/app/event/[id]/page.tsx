import React from "react";
import Link from "next/link";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";

type EventRow = {
    event_id: number | string;
    tittel: string;
    beskrivelse?: string | null;
    lokasjon?: string | null;
    tid?: Date | string | null;
    host_id?: number;
};

async function fetchEvent(id: string): Promise<EventRow | null> {
    try {
        const result = await query(
            `SELECT event_id, tittel, beskrivelse, tid, host_id, breddegrad as latitude, lengdegrad as longitude
       FROM arrangement
       WHERE event_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (err: any) {
        console.error("❌ Klarte ikke hente event:", err);
        return null;
    }
}

function formatDate(d?: string | Date | null) {
    if (!d) return "Ukjent dato";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleString("nb-NO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const event = await fetchEvent(id);

    if (!event) {
        notFound();
    }

    return (
        <main className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-[#a0814d] hover:text-[#8b6f3f] mb-6 text-sm font-medium transition-colors"
                >
                    ← Tilbake til events
                </Link>

                <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="gradient-event-card p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 grain-texture"></div>
                        <h1 className="text-3xl font-bold mb-2 relative z-10">{event.tittel}</h1>
                        {event.lokasjon && (
                            <p className="flex items-center text-white/95 text-lg relative z-10">
                                <span className="mr-2">📍</span>
                                {event.lokasjon}
                            </p>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center text-gray-700">
                                <span className="mr-2 text-xl">🗓️</span>
                                <time className="text-lg font-medium">{formatDate(event.tid)}</time>
                            </div>
                        </div>

                        {event.beskrivelse && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 text-gray-900">
                                    Om eventet
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {event.beskrivelse}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Event ID: {event.event_id} | Host ID: {event.host_id || "Ukjent"}
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        </main>
    );
}
