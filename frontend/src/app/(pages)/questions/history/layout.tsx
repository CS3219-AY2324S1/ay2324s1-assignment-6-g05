import { HistoryProvider } from "@/contexts/history";

export default function HistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <HistoryProvider>
            {children}
        </HistoryProvider>
    );
}
