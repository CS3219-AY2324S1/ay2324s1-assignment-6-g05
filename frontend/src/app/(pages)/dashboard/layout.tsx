import Container from "@/components/common/Container";
import { HistoryProvider } from "@/contexts/history";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <HistoryProvider>
            <Container>
                {children}
            </Container>
        </HistoryProvider>
    );
}
