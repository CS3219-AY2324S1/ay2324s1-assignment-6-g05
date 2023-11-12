import { getTopics } from "@/helpers/question/question_api_wrappers";
import { createContext, useContext, useState } from "react";
import { getLogger } from "@/helpers/logger";

interface ITopicContext {
  topics: string[];
  isNotFoundError: boolean;
  fetchTopics: () => Promise<void>;
}

const TopicContext = createContext<ITopicContext>({
  topics: [],
  isNotFoundError: false,
  fetchTopics: async () => {},
});

const useTopicContext = () => useContext(TopicContext);

const TopicProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNotFoundError, setIsNotFoundError] = useState<boolean>(false);
  const [topics, setTopics] = useState<string[]>([]);

  const fetchTopics = async () => {
    try {
      if (topics.length > 0) {
        return;
      }
      const rawTopics = await getTopics();
      setTopics(rawTopics);
    } catch (error) {
      getLogger().error(error);
      setTopics([]);
      setIsNotFoundError(true);
    }
  };

  return (
    <TopicContext.Provider value={{ topics, isNotFoundError, fetchTopics }}>
      {children}
    </TopicContext.Provider>
  );
};

export { TopicProvider, useTopicContext };
