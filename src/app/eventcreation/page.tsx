// app/eventcreation/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const CreateEventPage: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");
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
          lokasjon: location,
          tid: dateTime,
          host_id: parseInt(session.user.id),
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
      setLocation("");
      setDateTime("");

      setTimeout(() => {
        router.push("/event_list");
      }, 500);
    } catch (error: any) {
      console.error("Feil ved lagring av event:", error);
      setMessage(error.message || "Kunne ikke lagre eventet. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div style={styles.container}>Laster...</div>;
  }

  if (!session) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Du må være logget inn</h1>
        <button
          onClick={() => router.push("/login")}
          style={styles.button}
        >
          Gå til innlogging
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Opprett nytt event</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>
            Tittel:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>
            Beskrivelse:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            disabled={isLoading}
            style={styles.textarea}
          ></textarea>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="location" style={styles.label}>
            Lokasjon:
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={isLoading}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="dateTime" style={styles.label}>
            Dato og tid:
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            disabled={isLoading}
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? "Lagrer..." : "Lagre event"}
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  heading: {
    textAlign: "center",
    color: "#000000ff",
    marginBottom: "30px",
    fontSize: "2em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#000000ff",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1em",
    width: "100%",
    boxSizing: "border-box", // Inkluderer padding og border i bredden
    color: "Black",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1em",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical", // Lar brukeren endre høyden på tekstboksen
    color: "Black",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1.1em",
    marginTop: "10px",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  message: {
    marginTop: "20px",
    textAlign: "center",
    color: "#007bff",
    fontWeight: "bold",
  },
};

export default CreateEventPage;
