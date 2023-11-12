"use client";

import { HistoryService } from "@/helpers/history/history_api_wrappers";
import { CodeSubmission, QuestionHistory } from "@/types/history";
import User from "@/types/user";
import { createContext, useContext, useState } from "react";
import { useAuthContext } from "./auth";
import { getQuestionById } from "@/helpers/question/question_api_wrappers";
import Question from "@/types/question";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
import { useRouter } from "next/navigation";

interface IHistoryContext {
  user: User | undefined;
  isLoading: boolean;
  isNotFoundError: boolean;
  history: QuestionHistory[];
  question: Question | undefined;
  code: string | undefined;
  language: string | undefined;
  completedAt: Date | undefined;
  handleRetrieveHistory: () => Promise<void>;
  handleRetrieveQuestionCode: (
    questionId: string,
    language: string,
    completedAt: number
  ) => Promise<void>;
}

const HistoryContext = createContext<IHistoryContext>({
  user: undefined,
  isLoading: false,
  isNotFoundError: false,
  history: [],
  question: undefined,
  code: undefined,
  language: undefined,
  completedAt: undefined,
  handleRetrieveHistory: async () => {},
  handleRetrieveQuestionCode: async () => {},
});

const useHistoryContext = () => useContext(HistoryContext);

const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFoundError, setIsNotFoundError] = useState<boolean>(false);
  const [history, setHistory] = useState<QuestionHistory[]>([]);

  const [question, setQuestion] = useState<Question>();
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [completedAt, setCompletedAt] = useState<Date>();

  const handleRetrieveHistory = async () => {
    setIsLoading(true);

    const timeoutMs = 2000;
    try {
      if (!user || !user.id) {
        setIsNotFoundError(true);
        return;
      }

      // Create a promise that resolves when the history is successfully fetched
      const historyPromise1 = HistoryService.getAttemptedQuestionsHistory(
        user.id
      );

      // Create a promise that rejects with a timeout error if the operation takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Operation timed out"));
        }, timeoutMs);
      });

      // Use Promise.race to await either the history or the timeout
      const rawHistory = (await Promise.race([
        historyPromise1,
        timeoutPromise,
      ])) as QuestionHistory[];

      setHistory(rawHistory);
    } catch (error: any) {
      if (error instanceof PeerPrepErrors.NotFoundError) {
        // a not found will mean that the user has no history
        setHistory([]);
      } else if (error.message === "Operation timed out") {
        try {
          const rawHistory = await HistoryService.getAttemptedQuestionsHistory(
            user.id!
          );
          setHistory(rawHistory);
        } catch (error) {
          setHistory([]);
        }
      } else {
        setIsNotFoundError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieveQuestionCode = async (
    questionId: string,
    language: string,
    completedAt: number
  ) => {
    setIsLoading(true);
    try {
      if (!user || !user.id || !questionId || !language || !completedAt) {
        setIsNotFoundError(true);
        return;
      }

      language = decodeURIComponent(language);

      // get the question detail and the code submission
      const promises = [
        getQuestionById(questionId),
        HistoryService.getQuestionCodeSubmission(user.id, questionId, language),
      ];

      const responses = await Promise.all(promises);

      const question = responses[0] as Question;
      const codeSubmission = responses[1] as CodeSubmission;

      if (
        !question ||
        !question.title ||
        !codeSubmission ||
        !codeSubmission.code
      ) {
        setIsNotFoundError(true);
        return;
      }

      // set the question detail, and the code submission
      setQuestion(question);
      setCode(codeSubmission.code);

      // set the language
      switch (language.toLowerCase()) {
        case "c++":
          language = "cpp";
          break;
        case "java":
          language = "java";
          break;
        case "python":
          language = "python";
          break;
        case "javascript":
          language = "javascript";
          break;
        default:
          setIsNotFoundError(true);
          return;
      }
      setLanguage(language);

      // set the completed date
      setCompletedAt(new Date(completedAt));
    } catch (error) {
      setIsNotFoundError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HistoryContext.Provider
      value={{
        user,
        isLoading,
        isNotFoundError,
        history,
        question,
        code,
        language,
        completedAt,
        handleRetrieveHistory,
        handleRetrieveQuestionCode,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export { useHistoryContext, HistoryProvider };
