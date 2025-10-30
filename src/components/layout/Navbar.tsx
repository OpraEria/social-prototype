"use client"; // fordi vi bruker interaktiv navigasjon (React hooks, events etc.)
import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        background: "#f2f2f2",
      }}
    >
      |{/* <Link href="/">Hjem</Link> */}
      {/* <Link href="/about">Om oss</Link> */}
      {/* <Link href="/contact">Kontakt</Link> */}
    </nav>
  );
}
