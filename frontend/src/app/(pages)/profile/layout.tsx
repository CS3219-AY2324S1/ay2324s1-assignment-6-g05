import NavBar from "@/components/common/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile",
    description: "profile information",
}

export default function ProfileLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <div className="h-screen bg-background" suppressHydrationWarning={true}>
            {children}
        </div>
    );
  }
