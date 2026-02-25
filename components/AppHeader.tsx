"use client";

import Link from "next/link";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export function AppHeader() {
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-0 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2.5">
          <div className="w-4 h-4 bg-accent rounded-[3px] shadow-[0_0_15px_rgba(0,229,153,0.5)]" />
          Sentinel
        </Link>
        <div className="flex items-center gap-4">
          {isSignedIn && (
            <Link href="/app/app" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          )}
          {isSignedIn ? (
            <SignOutButton>
              <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
