// app/eventcreation/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const CreateEventPage: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Lagrer event...");

    try {
      console.log("Sender event:", { title, description });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage("Eventet ble lagret!");
      setTitle(""); // Tøm feltet etter lagring
      setDescription(""); // Tøm feltet etter lagring

      setTimeout(() => {
        router.push("/event_list");
      }, 500); // Vent 0.5 sekunder før navigering
    } catch (error) {
      console.error("Feil ved lagring av event:", error);
      setMessage("Kunne ikke lagre eventet. Prøv igjen.");
    }
  };

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
            style={styles.textarea}
          ></textarea>
        </div>
        <button type="submit" style={styles.button}>
          Lagre event
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
    color: "#333",
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
    color: "#555",
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
