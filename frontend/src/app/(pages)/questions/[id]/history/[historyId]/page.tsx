"use client";

import { useHistoryContext } from "@/contexts/history";
import { notFound, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import HistoryCodeSpace from "@/components/history/HistoryCodeSpace";

interface pageProps {
  params: {
    id: string;
    historyId: string;
  };
}

const QuestionHistoryPage = ({ params }: pageProps) => {
  const searchParams = useSearchParams();
  const language = searchParams.get("language");
  const completedAt = searchParams.get("completedAt");

  const {
    question,
    code,
    isLoading,
    isNotFoundError,
    handleRetrieveQuestionCode,
  } = useHistoryContext();

  useEffect(() => {
    if (!language) {
      return notFound();
    }

    if (!completedAt) {
      return notFound();
    }

    if (!question || !code) {
      handleRetrieveQuestionCode(params.id, language, parseInt(completedAt));
    }
  }, [question, code, language, completedAt]);

  if (isNotFoundError) {
    return notFound();
  }

  return (
    <div>{isLoading ? <LogoLoadingComponent /> : <HistoryCodeSpace />}</div>
  );
};

export default QuestionHistoryPage;
