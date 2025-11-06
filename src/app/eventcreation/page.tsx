// app/eventcreation/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { ssr: false }
);

const CreateEventPage: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "loading") {
      setMessage("Vennligst vent...");
      return;
    }

    if (!session?.user?.id) {
      setMessage("Du må være logget inn for å opprette et event.");
      return;
    }

    setIsLoading(true);
    setMessage("Lagrer event...");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tittel: title,
          beskrivelse: description,
          tid: dateTime,
          host_id: parseInt(session.user.id),
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke lagre eventet");
      }

      const data = await response.json();
      console.log("Event opprettet:", data);

      setMessage("Eventet ble lagret!");
      setTitle("");
      setDescription("");
      setDateTime("");
      setLatitude("");
      setLongitude("");

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: any) {
      console.error("Feil ved lagring av event:", error);
      setMessage(error.message || "Kunne ikke lagre eventet. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Laster...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Du må være logget inn</CardTitle>
            <CardDescription>For å opprette et event må du først logge inn</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Gå til innlogging</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Tilbake til events
          </Button>
        </Link>

        <Card className="shadow-xl  rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-gray-50 to-white">
            <CardTitle className="text-3xl text-gray-900">Opprett nytt event</CardTitle>
            {/* <CardDescription className="text-gray-600">Fyll ut informasjonen om ditt arrangement</CardDescription> */}
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tittel
                </label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder=""
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Beskrivelse
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  disabled={isLoading}
                  placeholder=""
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dateTime" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dato og tid
                </label>
                <Input
                  type="datetime-local"
                  id="dateTime"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="latitude" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Latitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    disabled={isLoading}
                    placeholder="59.9139"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="longitude" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Longitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    disabled={isLoading}
                    placeholder="10.7522"
                    className="text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Velg lokasjon på kartet
                </label>
                {/* <p className="text-xs text-muted-foreground mb-3">
                  Klikk på kartet eller dra på markøren for å velge lokasjon
                </p> */}
                <LocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={(lat, lng) => {
                    setLatitude(lat.toFixed(6));
                    setLongitude(lng.toFixed(6));
                  }}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Lagrer..." : "Lagre event"}
              </Button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-md ${message.includes("Feil") || message.includes("Kunne ikke")
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-green-50 text-green-800 border border-green-200"
                }`}>
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEventPage;
