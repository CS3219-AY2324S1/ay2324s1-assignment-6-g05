import ComplexityDonutChart from "./donut-chart/ComplexityDonutChart";
import LanguageDonutChart from "./donut-chart/LanguageDonutChart";
import { useHistoryContext } from "@/contexts/history";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";
import { Card } from "@nextui-org/react";

const StatisticsCard = () => {
  const { isLoading } = useHistoryContext();

  return (
    <Card className="flex flex-col h-full justify-start bg-black rounded-lg px-6 py-1 text-sm overflow-auto">
      <p className="text-base mt-2">Solved Problems</p>
      {isLoading ? (
        <SpinnerLoadingComponent />
      ) : (
        <div>
          <ComplexityDonutChart width={130} height={130} />
          <LanguageDonutChart width={130} height={130} />
        </div>
      )}
    </Card>
  );
};

export default StatisticsCard;
