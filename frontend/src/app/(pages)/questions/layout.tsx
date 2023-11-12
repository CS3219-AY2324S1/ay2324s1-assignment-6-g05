import Container from "@/components/common/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Questions",
    description: "coding questions",
};

export default function QuestionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Container>
            {children}
        </Container>
    );
}
