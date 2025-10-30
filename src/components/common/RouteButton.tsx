"use client";
import { useRouter } from "next/navigation";
import React from "react";

type ButtonProps = {
  label: string;
  to: string;
};

export default function Button({ label, to }: ButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(to)}
      style={{
        padding: "0.6rem 1.2rem",
        borderRadius: "6px",
        background: "#0070f3",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
