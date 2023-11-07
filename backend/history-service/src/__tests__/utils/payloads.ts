export function generateCUID() {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyz";

  // Start with one of the characters from 'cdefghij'
  let cuid = "cln";

  // Generate the remaining 25 characters
  for (let i = 0; i < 22; i++) {
    cuid += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return cuid;
}

export const getHistoryPayload = ({
  userId,
  questionId,
}: {
  userId?: string;
  questionId?: string;
}) => {
  if (userId && questionId) {
    return [
      {
        id: generateCUID(),
        userId: userId,
        questionId: questionId,
        title: "title",
        topics: ["ARRAY", "STRING"],
        complexity: "EASY",
        language: "C++",
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return [
    {
      id: generateCUID(),
      userId: userId ? userId : generateCUID(),
      questionId: questionId ? questionId : generateCUID(),
      title: "title 1",
      topics: ["ARRAY", "STRING"],
      complexity: "EASY",
      language: "C++",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateCUID(),
      userId: userId ? userId : generateCUID(),
      questionId: questionId ? questionId : generateCUID(),
      title: "title 2",
      topics: ["TWO POINTERS", "SORTING"],
      complexity: "MEDIUM",
      language: "JAVA",
      createdAt: new Date().toISOString(),
    },
    {
      id: generateCUID(),
      userId: userId ? userId : generateCUID(),
      questionId: questionId ? questionId : generateCUID(),
      title: "title 3",
      topics: ["BREADTH-FIRST SEARCH", "DEPTH-FIRST SEARCH", "GRAPH"],
      complexity: "HARD",
      language: "PYTHON",
      createdAt: new Date().toISOString(),
    },
  ];
};

export const getCreateHistoryBodyPayload = ({
  userId,
  questionId,
  language = "C++",
  hasCode = false,
}: {
  userId?: string | string[];
  questionId?: string;
  language?: string;
  hasCode?: boolean;
}) => {
  return {
    userId: userId,
    questionId: questionId,
    language: language,
    code: hasCode
      ? language === "C++"
        ? '#include <iostream>\n\nint main() {\n\tstd::cout << "Hello World!";\n\treturn 0;\n}'
        : language === "JAVA"
        ? 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World!");\n\t}\n}'
        : language === "PYTHON"
        ? 'print("Hello World!")'
        : language === "JAVASCRIPT"
        ? 'console.log("Hello World!")'
        : ""
      : undefined,
  };
};

const getUpdateCodeHistoryBodyPayload = ({
  language = "C++",
  code,
}: {
  language?: string;
  code?: string;
}) => {
  if (code) {
    return {
      language: language,
      code: code,
    };
  }
  switch (language.toUpperCase()) {
    case "C++":
      return {
        language: language,
        code: '#include <iostream>\n\nint main() {\n\tstd::cout << "Hello World!";\n\treturn 0;\n}',
      };
    case "JAVA":
      return {
        language: language,
        code: 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World!");\n\t}\n}',
      };
    case "PYTHON":
      return { language: language, code: 'print("Hello World!")' };
    case "JAVASCRIPT":
      return { language: language, code: 'console.log("Hello World!")' };
    default:
      return { language: language, code: "" };
  }
};

export const HistoryPayload = {
  getHistoryPayload,
  getCreateHistoryBodyPayload,
  getUpdateCodeHistoryBodyPayload,
};
