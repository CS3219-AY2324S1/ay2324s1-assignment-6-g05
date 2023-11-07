import Question from "@/types/question";
import QuestionTable from "@/components/question/QuestionTable";
import { getQuestionList } from "@/helpers/question/question_api_wrappers";

export default async function QuestionsPage() {
  const questions: Question[] = await getQuestionList();

  return (
    <>
      <QuestionTable questions={questions}></QuestionTable>
    </>
  );
}
