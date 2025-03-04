"use client";

import { SessionProvider } from "next-auth/react";

// Simple version without SessionProvider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 