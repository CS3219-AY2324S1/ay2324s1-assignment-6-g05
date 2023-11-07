import { useHistoryContext } from "@/contexts/history";
import { HistoryService } from "@/helpers/history/history_api_wrappers";
import { Badge, Chip } from "@nextui-org/react";
import { useState } from "react";

const QuestionFilter = () => {
  const { history } = useHistoryContext();
  const [showMore, setShowMore] = useState(false);

  const maxTopicsToShow = 5;

  const topicData =
    HistoryService.getNumberOfAttemptedQuestionsByTopic(history);

  return (
    <div>
      Solved topics:
      {topicData
        .slice(0, showMore ? topicData.length : maxTopicsToShow)
        .map((topic) => (
          <Chip className="my-1 ml-1" key={topic.name}>
            {topic.name} <span className="font-semibold">x{topic.value}</span>
          </Chip>
        ))}
      {topicData.length > maxTopicsToShow && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mx-2 text-sm text-sky-500 hover:underline"
        >
          {showMore ? "Hide" : "Show more..."}
        </button>
      )}
    </div>
  );
};

export default QuestionFilter;
