import { getQuestionById } from "@/helpers/question/question_api_wrappers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProblemDescription from "@/components/common/ProblemDescription";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import Question from "@/types/question";

async function getQuestion(id: string) {
  const response = await getQuestionById(id, "no-cache");
  if ("title" in response) {
    return response as Question;
  } else {
    notFound();
  }
}

export default async function QuestionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const question = await getQuestion(params.id);

  return (
    <Suspense fallback={<LogoLoadingComponent />}>
      <ProblemDescription question={question} />
    </Suspense>
  );
}
