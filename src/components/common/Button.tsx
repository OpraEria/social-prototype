"use client"; // denne må være client component hvis du vil bruke onClick etc.
import React from "react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export default function Button({ label, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: "none",
        background: "#0070f3",
        color: "white",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
