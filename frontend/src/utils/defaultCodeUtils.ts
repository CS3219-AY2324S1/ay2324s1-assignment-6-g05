import { StringUtils } from "./stringUtils";

export const getCodeTemplate = (
  language: string,
  questionTitle: string
): string => {
  // transform the question title into a camel case string
  const formattedQuestionTitle =
    StringUtils.convertStringToCamelCase(questionTitle);

  switch (language.toLowerCase()) {
    case "cpp":
      return `class Solution {\npublic:\n\t// change your function type below if necessary\n\tvoid ${formattedQuestionTitle}(/*define your params here*/){\n\t\t\n\t};\n}`;
    case "java":
      return `class Solution {\n\t// change your function type below if necessary\n\tpublic static void ${formattedQuestionTitle}(/*define your params here*/) {\n\t\t\n\t}\n}\n`;
    case "python":
      return `class Solution:\n\tdef ${formattedQuestionTitle}():\n\t\treturn\n`;
    case "javascript":
      return `const ${formattedQuestionTitle} = (/*define your params here*/) => {\n\treturn;\n}`;
    default:
      return "";
  }
};
