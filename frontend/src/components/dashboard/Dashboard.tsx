"use client";

import { useEffect } from "react";
import ProfileDashboardCard from "./ProfileDashboardCard";
import HeatmapCard from "./HeatmapCard";
import MatchingCard from "../matching/MatchingCard";
import StatisticsCard from "./StatisticsCard";
import QuestionStatisticsCard from "./QuestionStatisticsCard";
import { useHistoryContext } from "@/contexts/history";
import { useTopicContext } from "@/contexts/topic";

const Dashboard = () => {
  const { handleRetrieveHistory } = useHistoryContext();
  const { fetchTopics } = useTopicContext();

  useEffect(() => {
    handleRetrieveHistory();
    fetchTopics();
  }, []);

  return (
    <div className="grid md:grid-rows-2 md:grid-cols-4 gap-3 h-[93vh] sm:grid-row-3 sm:grid-cols-2 mx-auto">
      <div className="row-start-1 col-start-1">
        <ProfileDashboardCard />
      </div>
      <div className="row-start-1 col-start-2 md:col-span-2 sm:col-span-1">
        <HeatmapCard />
      </div>
      <div className="md:row-start-1 md:col-start-4 sm:row-start-2 sm:col-start-1">
        <MatchingCard />
      </div>
      <div className="row-start-2 md:col-start-1 sm:col-start-2">
        <StatisticsCard />
      </div>
      <div className="md:row-start-2 md:col-start-2 md:col-span-3 sm:row-start-3 sm:col-start-1 sm:col-span-2">
        <QuestionStatisticsCard />
      </div>
    </div>
  );
};

export default Dashboard;
