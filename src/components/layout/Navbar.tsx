"use client";
import Link from "next/link";
import { Calendar, Home, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-gray-700 transition-colors">
              <Image src="/Gather.svg" alt="Gather" width={30} height={10} className="h-4 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {session.user?.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logg ut
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Logg inn</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
