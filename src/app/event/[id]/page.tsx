"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, ArrowLeft } from "lucide-react";

const EventMap = dynamic(() => import("@/components/EventMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Laster kart...</p>
        </div>
    ),
});

type EventRow = {
    event_id: number | string;
    tittel: string;
    beskrivelse?: string | null;
    lokasjon?: string | null;
    tid?: Date | string | null;
    host_id?: number;
    latitude?: number | null;
    longitude?: number | null;
};

type User = {
    bruker_id: number;
    navn: string;
};

type Participant = {
    bruker_id: number;
    navn: string;
};

function formatDate(d?: string | Date | null) {
    if (!d) return "Ukjent dato";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("nb-NO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatTime(d?: string | Date | null) {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [id, setId] = useState<string>("");
    const [event, setEvent] = useState<EventRow | null>(null);
    const [host, setHost] = useState<User | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then((p) => setId(p.id));
    }, [params]);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                // Fetch event
                const eventRes = await fetch(`/api/events`);
                const events: EventRow[] = await eventRes.json();
                const foundEvent = events.find((e) => String(e.event_id) === id);

                if (foundEvent) {
                    setEvent(foundEvent);

                    // Fetch users to get host name
                    const usersRes = await fetch(`/api/users`);
                    const users: User[] = await usersRes.json();
                    const foundHost = users.find((u) => u.bruker_id === foundEvent.host_id);
                    setHost(foundHost || null);

                    // Fetch participants
                    const participantsRes = await fetch(`/api/events/${id}/participants`);
                    if (participantsRes.ok) {
                        const participantsData = await participantsRes.json();
                        setParticipants(participantsData);
                    }
                }
            } catch (err) {
                console.error("Error fetching event:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    const handleJoinEvent = async () => {
        if (!id) return;

        try {
            const res = await fetch(`/api/events/${id}/join`, {
                method: "POST",
            });

            if (!res.ok) {
                const error = await res.json();
                if (error.error.includes("already participating")) {
                    alert("Du deltar allerede i dette eventet");
                } else {
                    throw new Error(error.error);
                }
                return;
            }

            // Refresh participants
            const participantsRes = await fetch(`/api/events/${id}/participants`);
            if (participantsRes.ok) {
                const participantsData = await participantsRes.json();
                setParticipants(participantsData);
            }

            alert("Du er nå påmeldt eventet!");
        } catch (err) {
            console.error("Failed to join event:", err);
            alert("Kunne ikke bli med i eventet");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Laster...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="min-h-screen p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Event ikke funnet</p>
                        <Link href="/">
                            <Button variant="ghost" className="mt-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Tilbake til oversikten
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/">
                    <Button
                        variant="ghost"
                        className="mb-6 text-[#a0814d] hover:text-[#8b6f3f] hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Tilbake til oversikten
                    </Button>
                </Link>

                <article className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    {/* Gradient Header */}
                    <div className="gradient-event-card p-8 md:p-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 grain-texture"></div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 relative z-10">
                            {event.tittel}
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-6">
                        {/* Date and Host - Compact */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <Calendar className="h-4 w-4 text-[#a0814d]" />
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-900">{formatDate(event.tid)}</span>
                                    {event.tid && (
                                        <span className="text-[#a0814d] font-medium ml-2">
                                            Kl. {formatTime(event.tid)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {host && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <User className="h-4 w-4 text-[#a0814d]" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Arrangert av</span>
                                        <span className="font-semibold text-gray-900 ml-1">{host.navn}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {event.beskrivelse && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                                    Om eventet
                                </h2>
                                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                    {event.beskrivelse}
                                </p>
                            </div>
                        )}

                        {/* Map */}
                        {event.latitude && event.longitude && (
                            <div>
                                <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
                                    <EventMap events={[event]} />
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        {participants.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-[#a0814d]" />
                                    Deltagere ({participants.length})
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {participants.map((participant) => (
                                        <div
                                            key={participant.bruker_id}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b8996f] to-[#8b6f3f] flex items-center justify-center text-white text-sm font-semibold">
                                                {participant.navn.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {participant.navn}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Join Button */}
                        <div className="pt-4">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-semibold rounded-xl"
                                onClick={handleJoinEvent}
                            >
                                Bli med
                            </Button>
                        </div>
                    </div>
                </article>
            </div>
        </main>
    );
}
