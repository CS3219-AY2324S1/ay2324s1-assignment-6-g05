"use client";

import { AuthProvider } from "@/contexts/auth";
import { NextUIProvider } from "@nextui-org/react";
import { TopicProvider } from "./topic";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <AuthProvider>
        <TopicProvider>
            {children}
        </TopicProvider>
      </AuthProvider>
    </NextUIProvider>
  );
}
