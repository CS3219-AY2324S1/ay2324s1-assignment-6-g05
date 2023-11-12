import { Card } from "@nextui-org/react";
import ActivityHeatMap from "./heatmap/ActivityHeatMap";
import { useHistoryContext } from "@/contexts/history";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";

const HeatmapCard = () => {
  const { isLoading } = useHistoryContext();

  return (
    <Card className="flex flex-col h-full p-4 py-2 bg-black rounded-lg">
      {isLoading ? (
        <SpinnerLoadingComponent />
      ) : (
        <div>
          <ActivityHeatMap />
        </div>
      )}
    </Card>
  );
};

export default HeatmapCard;
