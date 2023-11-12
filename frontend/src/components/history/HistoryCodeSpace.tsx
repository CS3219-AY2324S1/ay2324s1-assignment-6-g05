import Split from "react-split";
import ProblemDescription from "../common/ProblemDescription";
import { useHistoryContext } from "@/contexts/history";
import { notFound } from "next/navigation";
import ReadOnlyCodeEditor from "./ReadOnlyCodeEditor";
import { Chip, Divider } from "@nextui-org/react";
import { Icons } from "../common/Icons";

const HistoryCodeSpace = ({}) => {
  const { question, completedAt, language } = useHistoryContext();

  if (!question) {
    return notFound();
  }

  if (!language) {
    return notFound();
  }

  if (!completedAt) {
    return notFound();
  }

  const formatLanguage = (language: string) => {
    let languageTextToDisplay = language;
    switch (language) {
      case "cpp":
        languageTextToDisplay = "C++";
        break;
      case "python":
        languageTextToDisplay = "Python";
        break;
      case "java":
        languageTextToDisplay = "Java";
        break;
      case "javascript":
        languageTextToDisplay = "JavaScript";
        break;
      default:
        languageTextToDisplay = "Unknown";
        break;
    }

    return (
      <Chip
        color="warning"
        variant="faded"
        size="sm"
        className="mx-1 text-center"
      >
        {languageTextToDisplay}
      </Chip>
    );
  };

  return (
    <Split className="flex flex-row h-[calc(100vh-94px)]">
      <ProblemDescription question={question} />
      <div>
        <div className="m-1 mb-0 p-1">
          <div className="inline-block text-lg bg-green-500 rounded-lg align-middle mr-2">
            <Icons.TiTick />
          </div>{" "}
          <div className="inline-block">
            You completed this question on{" "}
            <span className="font-semibold">
              {completedAt.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Singapore",
              })}
            </span>
          </div>
        </div>

        <div className="mx-1 p-1">Language: {formatLanguage(language)}</div>

        <Divider />
        <ReadOnlyCodeEditor />
      </div>
    </Split>
  );
};

export default HistoryCodeSpace;
