import QuestionFilter from "./question-statistics/QuestionFilter";
import AttemptedQuestionTable from "./question-statistics/AttemptedQuestionTable";
import { useHistoryContext } from "@/contexts/history";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";
import { Card } from "@nextui-org/react";

const QuestionStatisticsCard = () => {
  const { isLoading } = useHistoryContext();

  return (
    <Card className="flex flex-col h-full gap-2 bg-black rounded-lg p-4 overflow-y-auto">
      {isLoading ? (
        <SpinnerLoadingComponent />
      ) : (
        <>
          <QuestionFilter />
          <AttemptedQuestionTable />
        </>
      )}
    </Card>
  );
};

export default QuestionStatisticsCard;
