/* -------------------------------------------------------------------------- */
/*                      mock backend for history service                      */
/* -------------------------------------------------------------------------- */

import { DOMAIN, HTTP_METHODS } from "@/types/enums";
import api from "../endpoint";
import { getLogger } from "../logger";
import HttpStatusCode from "@/types/HttpStatusCode";
import History, { DataItem, QuestionHistory } from "@/types/history";
import { getError, throwAndLogError } from "@/utils/errorUtils";
import { StringUtils } from "../../utils/stringUtils";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";

const logger = getLogger("history_api_wrappers");

const historyDomain = DOMAIN.HISTORY;

const baseRoute = "history";

const getAttemptedQuestionsHistory = async (userId: string) => {
  const queryParam = `?userId=${userId}`;
  const response = await api({
    method: HTTP_METHODS.GET,
    domain: historyDomain,
    path: baseRoute + queryParam,
  });

  if (response.status === HttpStatusCode.OK) {
    const history = response.data;

    const data: QuestionHistory[] = [];

    if (Array.isArray(history.data)) {
      history.data.map((record: History) => {
        const languages = record.languages;
        languages.forEach((language) => {
          data.push({
            id: record.id,
            questionId: record.questionId,
            title: record.question.title,
            complexity: record.question.complexity,
            topics: record.question.topics,
            language: language,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          });
        });
      });

      return data;
    }
  }

  return throwAndLogError(
    "getAttemptedQuestions",
    response.message,
    getError(response.status)
  );
};

const getNumberOfAttemptedQuestionsByComplexity = (
  history: QuestionHistory[],
  requireSorting: boolean = true
): DataItem[] => {
  if (!history || history.length === 0) {
    return [];
  }

  const complexityCountMap = new Map<string, number>();
  const questionSet = new Set<string>();

  history.forEach((record) => {
    const complexity = StringUtils.convertStringToTitleCase(record.complexity);

    if (!questionSet.has(record.questionId)) {
      if (complexityCountMap.has(complexity)) {
        const count = complexityCountMap.get(complexity)!;
        complexityCountMap.set(complexity, count + 1);
      } else {
        complexityCountMap.set(complexity, 1);
      }
      questionSet.add(record.questionId);
    }
  });

  const data: DataItem[] = [];

  complexityCountMap.forEach((value, key) => {
    data.push({ name: key, value: value });
  });

  if (requireSorting) {
    data.sort((a, b) => {
      return b.value - a.value;
    });
  }

  return data;
};

const getNumberOfAttemptedQuestionsByTopic = (
  history: QuestionHistory[],
  requireSorting: boolean = true
): DataItem[] => {
  if (!history || history.length === 0) {
    return [];
  }

  const topicCountMap = new Map<string, number>();

  const questionSet = new Set<string>();

  history.forEach((record) => {
    if (!questionSet.has(record.questionId)) {
      questionSet.add(record.questionId);

      const topics = record.topics.map((topic) =>
        StringUtils.convertStringToTitleCase(topic)
      );

      topics.forEach((topic) => {
        if (topicCountMap.has(topic)) {
          const count = topicCountMap.get(topic)!;
          topicCountMap.set(topic, count + 1);
        } else {
          topicCountMap.set(topic, 1);
        }
      });
    }
  });

  const data: DataItem[] = [];
  topicCountMap.forEach((value, key) => {
    data.push({ name: key, value: value });
  });

  if (requireSorting) {
    data.sort((a, b) => {
      return b.value - a.value;
    });
  }

  return data;
};

const getNumberOfAttemptedQuestionsByLanguage = (
  history: QuestionHistory[],
  requireSorting: boolean = true
): DataItem[] => {
  if (!history || history.length === 0) {
    return [];
  }

  const languageCountMap = new Map<string, number>();

  history.forEach((record) => {
    if (languageCountMap.has(record.language)) {
      const count = languageCountMap.get(record.language)!;
      languageCountMap.set(record.language, count + 1);
    } else {
      languageCountMap.set(record.language, 1);
    }
  });

  const data: DataItem[] = [];

  languageCountMap.forEach((value, key) => {
    data.push({ name: key, value: value });
  });

  if (requireSorting) {
    data.sort((a, b) => {
      return b.value - a.value;
    });
  }

  return data;
};

const getNumberOfAttemptedQuestionsByDate = (history: QuestionHistory[]) => {
  if (!history || history.length === 0) {
    return [];
  }

  const dateCountMap = new Map<number, number>();

  history.forEach((question) => {
    const date: number = new Date(question.updatedAt).getTime();

    if (dateCountMap.has(date)) {
      const count = dateCountMap.get(date)!;
      dateCountMap.set(date, count + 1);
    } else {
      dateCountMap.set(date, 1);
    }
  });

  const data: { date: number; value: number }[] = [];
  dateCountMap.forEach((value, key) => {
    data.push({ date: key, value: value });
  });
  return data;
};

const getQuestionCodeSubmission = async (
  userId: string,
  questionId: string,
  language: string
) => {
  const response = await api({
    method: HTTP_METHODS.GET,
    domain: historyDomain,
    path:
      baseRoute +
      `/user/${userId}/question/${questionId}/code?language=${encodeURIComponent(
        language
      )}`,
  });

  if (response.status === HttpStatusCode.OK) {
    const data = response.data as { language: string; code: string };
    return data;
  }

  return throwAndLogError(
    "getQuestionCodeSubmission",
    response.message,
    getError(response.status)
  );
};

const createHistory = async (
  userId: string | string[],
  questionId: string,
  language: string,
  code: string
) => {
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: historyDomain,
    path: baseRoute,
    body: {
      userId: userId,
      questionId: questionId,
      language: convertLanguageToApiFormat(language),
      code: code,
    },
  });

  if (response.status === HttpStatusCode.CREATED) {
    const data = response.data;
    return data;
  }

  return throwAndLogError(
    "createHistory",
    response.message,
    getError(response.status)
  );
};

const updateQuestionCodeSubmission = async (
  userId: string,
  questionId: string,
  language: string,
  code: string
) => {
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: historyDomain,
    path: baseRoute + `/user/${userId}/question/${questionId}/code`,
    body: {
      language: convertLanguageToApiFormat(language),
      code: code,
    },
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "updateQuestionCodeSubmission",
    response.message,
    getError(response.status)
  );
};

const deleteHistory = async (userId: string, questionId: string) => {
  const response = await api({
    method: HTTP_METHODS.DELETE,
    domain: historyDomain,
    path: baseRoute + `/user/${userId}/questionId/${questionId}`,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "deleteHistory",
    response.message,
    getError(response.status)
  );
};

const postToHistoryService = async (
  userId: string,
  questionId: string,
  language: string,
  code: string
) => {
  try {
    await createHistory(userId, questionId, language, code);
  } catch (error) {
    if (error instanceof PeerPrepErrors.ConflictError) {
      await updateQuestionCodeSubmission(userId, questionId, language, code);
    } else {
      throw error;
    }
  }
};

const convertLanguageToApiFormat = (language: string) => {
  let convertedLanguage = language.toUpperCase();
  // convert language to API format
  switch (language.toLowerCase()) {
    case "cpp":
      convertedLanguage = "C++";
      break;
    case "python":
      convertedLanguage = "PYTHON";
      break;
    case "java":
      convertedLanguage = "JAVA";
      break;
    case "javascript":
      convertedLanguage = "JAVASCRIPT";
      break;
    default:
      break;
  }

  return convertedLanguage;
};

export const HistoryService = {
  getAttemptedQuestionsHistory,
  getNumberOfAttemptedQuestionsByComplexity,
  getNumberOfAttemptedQuestionsByTopic: getNumberOfAttemptedQuestionsByTopic,
  getNumberOfAttemptedQuestionsByLanguage,
  getNumberOfAttemptedQuestionsByDate,
  getQuestionCodeSubmission,
  createHistory,
  deleteHistory,
  postToHistoryService,
};
