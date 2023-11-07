import { CollabProvider } from "@/contexts/collab";
import React from "react";

export default function CollaborationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (<CollabProvider>{children}</CollabProvider>);
}
