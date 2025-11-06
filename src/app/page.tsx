"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, List, Map as MapIcon, Users as UsersIcon, Plus, UserPlus, Trash2 } from "lucide-react";

// Dynamic import for map to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import("@/components/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Laster kart...</p>
    </div>
  ),
});

type Event = {
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
  passord: string;
  gruppe_id: number;
};

type Participant = {
  bruker_id: number;
  navn: string;
};

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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Event states
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Participants state - map of event_id to array of participants
  const [participants, setParticipants] = useState<Map<number | string, Participant[]>>(new Map());

  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [navn, setNavn] = useState("");
  const [passord, setPassord] = useState("");
  const [gruppeId, setGruppeId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Request notification permission when user is authenticated
  useEffect(() => {
    const setupNotifications = async () => {
      if (status === "authenticated" && session?.user?.id) {
        // Dynamically import to avoid SSR issues
        const { subscribeToPushNotifications, checkNotificationPermission } = await import('@/lib/notifications');

        const permission = checkNotificationPermission();

        // Only prompt if not already decided
        if (permission === 'default') {
          // Small delay to not overwhelm user on login
          setTimeout(async () => {
            const confirmed = confirm('Vil du motta varsler når nye events blir publisert?');
            if (confirmed) {
              await subscribeToPushNotifications(session.user.id);
            }
          }, 1000);
        } else if (permission === 'granted') {
          // Re-subscribe in case subscription expired
          await subscribeToPushNotifications(session.user.id);
        }
      }
    };

    setupNotifications();
  }, [status, session]);

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        setEventsLoading(true);
        setEventsError(null);
        const res = await fetch("/api/events");
        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await res.json();
        // Sort events by date (most recent first)
        const sortedData = data.sort((a: Event, b: Event) => {
          const dateA = a.tid ? new Date(a.tid).getTime() : 0;
          const dateB = b.tid ? new Date(b.tid).getTime() : 0;
          return dateA - dateB; // Ascending order (soonest events first)
        });
        setEvents(sortedData);

        // Fetch participants for all events
        fetchAllParticipants(sortedData);
      } catch (err: any) {
        console.error("Failed to fetch events", err);
        setEventsError(err.message || "Failed to load events");
      } finally {
        setEventsLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchEvents();
      fetchUsers(); // Fetch users on page load to show host names
    }
  }, [status]);

  // Fetch participants for all events
  const fetchAllParticipants = async (eventsList: Event[]) => {
    try {
      const participantsMap = new Map<number | string, Participant[]>();

      await Promise.all(
        eventsList.map(async (event) => {
          try {
            const res = await fetch(`/api/events/${event.event_id}/participants`);
            if (res.ok) {
              const data = await res.json();
              participantsMap.set(event.event_id, data);
            }
          } catch (err) {
            console.error(`Failed to fetch participants for event ${event.event_id}`, err);
          }
        })
      );

      setParticipants(participantsMap);
    } catch (err) {
      console.error("Failed to fetch participants", err);
    }
  };

  // Fetch users when dialog opens
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await fetch("/api/users");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      setUsersError(err.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Add a new user
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navn, passord, gruppe_id: parseInt(gruppeId) }),
      });
      if (!res.ok) throw new Error("Failed to add user");
      const newUser: User = await res.json();
      setUsers([...users, newUser]);
      setNavn("");
      setPassord("");
      setGruppeId("");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: number | string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Er du sikker på at du vil slette dette eventet?")) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");

      // Remove event from local state
      setEvents(events.filter(event => event.event_id !== eventId));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Kunne ikke slette event");
    }
  };

  // Join an event
  const joinEvent = async (eventId: number | string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/events/${eventId}/join`, {
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

      // Refresh participants for this event
      const participantsRes = await fetch(`/api/events/${eventId}/participants`);
      if (participantsRes.ok) {
        const data = await participantsRes.json();
        setParticipants(new Map(participants.set(eventId, data)));
      }
    } catch (err) {
      console.error("Failed to join event:", err);
      alert("Kunne ikke bli med i eventet");
    }
  };

  if (status === "loading" || eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Laster...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:px-8 lg:px-12 sm:py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Events fra vennene dine
          </h1>
          <p className="text-gray-600 text-lg">
            Trykk på et event for mer info
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Liste
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-2"
            >
              <MapIcon className="h-4 w-4" />
              Kart
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (open) fetchUsers();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 h-10">
                  <UsersIcon className="h-4 w-4" />
                  Brukere
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Brukeradministrasjon
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Add User Form */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Legg til ny bruker
                    </h3>
                    <form onSubmit={addUser} className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="text"
                          placeholder="Navn"
                          value={navn}
                          onChange={(e) => setNavn(e.target.value)}
                          required
                        />
                        <Input
                          type="text"
                          placeholder="Passord"
                          value={passord}
                          onChange={(e) => setPassord(e.target.value)}
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Gruppe ID"
                          value={gruppeId}
                          onChange={(e) => setGruppeId(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2">
                        <UserPlus className="h-4 w-4" />
                        Legg til bruker
                      </Button>
                    </form>
                  </div>

                  {/* Users List */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Brukerliste ({users.length})
                    </h3>
                    {usersLoading ? (
                      <p className="text-sm text-muted-foreground">Laster brukere...</p>
                    ) : usersError ? (
                      <p className="text-sm text-destructive">{usersError}</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {users.map((user) => (
                          <div
                            key={user.bruker_id}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{user.navn}</p>
                              <p className="text-sm text-muted-foreground">
                                Gruppe {user.gruppe_id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/eventcreation">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Opprett event
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {eventsError ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{eventsError}</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Ingen events ennå</p>
              <Link href="/eventcreation">
                <Button>Opprett første event</Button>
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <div className="grid gap-4 md:gap-5">
            {events.map((event) => {
              const eventDate = event.tid ? new Date(event.tid) : null;
              const isUpcoming = eventDate && eventDate > new Date();

              // Calculate days until event
              let daysUntil = null;
              if (eventDate && isUpcoming) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventDay = new Date(eventDate);
                eventDay.setHours(0, 0, 0, 0);
                daysUntil = Math.ceil((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              }

              // Find host name
              const host = users.find(u => u.bruker_id === event.host_id);

              return (
                <Link
                  key={String(event.event_id)}
                  href={`/event/${event.event_id}`}
                  className="block group"
                >
                  <Card className="overflow-hidden border transition-all duration-300 hover:shadow-lg bg-white">
                    <div className="flex flex-row">
                      {/* Left side - Date badge */}
                      <div className="w-20 sm:w-24 gradient-event-card p-4 flex flex-col items-center justify-center text-white relative overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 grain-texture"></div>
                        {eventDate ? (
                          <>
                            <div className="text-3xl font-bold leading-none relative z-10">
                              {eventDate.getDate()}
                            </div>
                            <div className="text-xs uppercase tracking-wide mt-1 relative z-10">
                              {eventDate.toLocaleString('nb-NO', { month: 'short' })}
                            </div>
                            <div className="text-xs opacity-90 mt-1 relative z-10">
                              {eventDate.getFullYear()}
                            </div>
                          </>
                        ) : (
                          <Calendar className="h-8 w-8 relative z-10" />
                        )}
                      </div>

                      {/* Right side - Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-1">
                              {event.tittel}
                            </h3>
                            {daysUntil !== null && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {daysUntil === 0 ? 'I dag' : daysUntil === 1 ? 'I morgen' : `${daysUntil} dager igjen`}
                              </span>
                            )}
                          </div>
                          {eventDate && (
                            <div className="text-right hidden sm:block">
                              <div className="text-sm font-medium text-gray-900">
                                {eventDate.toLocaleString('nb-NO', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {eventDate.toLocaleString('nb-NO', { weekday: 'short' })}
                              </div>
                            </div>
                          )}
                        </div>

                        {event.beskrivelse && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                            {event.beskrivelse}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {host && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <UsersIcon className="h-3.5 w-3.5 text-primary" />
                                  <span>Arrangert av {host.navn}</span>
                                </div>
                              </div>
                            )}

                            {/* Participants avatars */}
                            {participants.get(event.event_id) && participants.get(event.event_id)!.length > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="flex -space-x-2">
                                  {participants.get(event.event_id)!.slice(0, 5).map((participant) => (
                                    <div
                                      key={participant.bruker_id}
                                      className="w-7 h-7 rounded-full bg-gradient-to-br from-[#b8996f] to-[#8b6f3f] border-2 border-white flex items-center justify-center text-white text-xs font-semibold shadow-sm"
                                      title={participant.navn}
                                    >
                                      {participant.navn.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                  {participants.get(event.event_id)!.length > 5 && (
                                    <div className="w-7 h-7 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-semibold shadow-sm">
                                      +{participants.get(event.event_id)!.length - 5}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground ml-1">
                                  {participants.get(event.event_id)!.length} deltar
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {session?.user?.gruppeId === 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => deleteEvent(event.event_id, e)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={(e) => joinEvent(event.event_id, e)}
                            >
                              Bli med
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="h-[600px]">
            <EventMap
              events={events}
              onEventClick={(eventId) => router.push(`/event/${eventId}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
