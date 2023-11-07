"use client";

import { useCollabContext } from "@/contexts/collab";
import ProblemDescription from "../common/ProblemDescription";
import { notFound } from "next/navigation";

const ProblemPanel = () => {
  const { question } = useCollabContext();

  if (!question) {
    return notFound();
  }

  return (
    <div className="h-[calc(100vh-60px)]">
      <ProblemDescription question={question} />
    </div>
  );
};

export default ProblemPanel;
