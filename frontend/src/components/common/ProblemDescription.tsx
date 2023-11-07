"use client"; // Question Detail Page requires this to be a client component

import Question from "@/types/question";
import { FC } from "react";
import ComplexityChip from "../question/ComplexityChip";
import { Chip, Divider } from "@nextui-org/react";
import parse from "html-react-parser";

interface IProblemDescriptionProps {
  question: Question;
}
const ProblemDescription: FC<IProblemDescriptionProps> = ({ question }) => {
  return (
    <div className="flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto">
      <div className="w-full px-5">
        {/* Question title */}
        <div className="flex space-x-4">
          <div className="flex-1 mr-2 text-xl text-white font-semibold">
            {question.title}
          </div>
        </div>
        {/* Question complexity */}
        <div className="flex items-center mt-3 gap-2">
            <ComplexityChip complexity={question.complexity} size="sm" />
            {
              question.topics.map(topic => (
                <Chip key={topic} size="sm" className="capitalize">{topic.toLowerCase()}</Chip>
              ))
            }
        </div>

        <Divider className="mt-4 mb-2" />

        {/* Question description */}
        <div className="flex mt-3">
          <div className="text-md text-white text-justify">
            {parse(question.description)}
          </div>
        </div>

        {/* Question examples */}
        <div className="mt-4">
          {question.examples?.map((example, index) => (
            <div key={index}>
              <p className="font-medium text-white ">Example {index + 1}: </p>
              <div className="">
                <pre className="bg-gray-600 bg-opacity-50 my-4 p-4 rounded-lg text-white text-sm whitespace-pre-wrap">
                  <strong className="text-white text-base">Input: </strong>{" "}
                  {parse(example.input)}
                  <br />
                  <strong className="text-white text-base">Output: </strong>
                  {parse(example.output)}
                  <br />
                  {example.explanation && (
                    <>
                      <strong className="text-white text-base">
                        Explanation:{" "}
                      </strong>
                      {example.explanation}
                    </>
                  )}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Question constraints */}
        <div className="my-8 pb-4">
          <div className="text-white text-sm font-medium">Constraints:</div>
          <ul className="text-white ml-5 list-disc ">
            {question.constraints?.map((constraint, index) => (
              <li key={index} className="my-1">
                <span className="bg-gray-500 bg-opacity-50 px-1 py-[.5] rounded-lg">
                  {constraint}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;
