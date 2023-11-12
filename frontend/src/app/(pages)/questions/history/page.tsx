"use client";

import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import AttemptedQuestionTable from "@/components/dashboard/question-statistics/AttemptedQuestionTable";
import { useHistoryContext } from "@/contexts/history";
import { useEffect } from "react";

const QuestionsHistoryPage = () => {
  const { history, isLoading, handleRetrieveHistory } = useHistoryContext();

  useEffect(() => {
    if (!history || history.length === 0) {
      handleRetrieveHistory();
    }
  }, []);

  return (
    <div>
      {isLoading ? (
        <LogoLoadingComponent />
      ) : (
        <div>
          <p className="mx-2 p-2 text-base">
            You have attempted {history.length} questions:
          </p>
          <AttemptedQuestionTable isFullPage={true} />
        </div>
      )}
    </div>
  );
};

export default QuestionsHistoryPage;
