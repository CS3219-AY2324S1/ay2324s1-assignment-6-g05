import { FormEvent, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import QuestionDescription from "./QuestionDescription";
import { COMPLEXITY, ToastType } from "@/types/enums";
import Question, { Example } from "@/types/question";
import QuestionExamplesTable from "./QuestionExamplesTable";
import QuestionConstrainsTable from "./QuestionConstrainsTable";
import {
  getQuestionById,
  getTopics,
  postQuestion,
  updateQuestion,
} from "@/helpers/question/question_api_wrappers";
import { FiCornerDownLeft } from "react-icons/fi";
import displayToast from "../common/Toast";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
import HttpStatusCode from "@/types/HttpStatusCode";
import { getLogger } from "@/helpers/logger";

export default function ModifyQuestionModal({
  isOpen,
  onOpenChange,
  closeCallback,
  questionId,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  closeCallback: () => void;
  questionId?: string;
}) {
  // component mode and const
  const editMode = questionId != null;
  const complexitySelections = Object.values(COMPLEXITY).map((k) => ({
    value: k,
  }));
  const [topicOptions, setTopicOptions] = useState<string[]>([]);

  // component states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  // form arguments
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [complexity, setComplexity] = useState("EASY");
  const [topics, setTopics] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [examples, setExamples] = useState<Example[]>([]);
  const [url, setUrl] = useState("");

  const retrieveQuestionDetail = async (questionId: string) => {
    try {
      const question = (await getQuestionById(questionId)) as Question;
      setId(question.id!);
      setTitle(question.title);
      setComplexity(question.complexity);
      setTopics(question.topics);
      setDescription(question.description);
      if (question.constraints) {
        setConstraints(question.constraints);
      }
      if (question.examples) {
        setExamples(question.examples);
      }
      setUrl(question.url);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Setup external resources
  useEffect(() => {
    async function setUpTopics() {
      getTopics().then((topics) => {
        setTopicOptions(topics);
      });
    }

    if (topicOptions.length === 0) {
      setUpTopics();
    }
  }, []);

  // prefill form base on mode
  useEffect(() => {
    if (isOpen && editMode) {
      setIsLoading(true);
      retrieveQuestionDetail(questionId);
    } else {
      setId("");
      setTitle("");
      setComplexity("EASY");
      setTopics([]);
      setDescription("");
      setConstraints([]);
      setExamples([]);
      setError("");
      setUrl("");
    }
  }, [isOpen]);

  // form action
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const question = {
        title: title.trim(),
        complexity: complexity,
        topics: Array.from(topics.values()),
        description: description.trim(),
        url: url.trim(),
        constraints:
          constraints.length > 0
            ? constraints.filter((x) => x !== "")
            : undefined,
        examples:
          examples.length > 0
            ? examples.filter((x) => x.input !== "" && x.output !== "")
            : undefined,
      };

      const response = editMode
        ? await updateQuestion(id, question)
        : await postQuestion(question);

      if (response.status === HttpStatusCode.CREATED) {
        displayToast("Question created.", ToastType.SUCCESS);
        closeCallback();
      } else if (response.status === HttpStatusCode.NO_CONTENT) {
        displayToast("Question updated.", ToastType.SUCCESS);
        closeCallback();
      } else if (response.status === HttpStatusCode.BAD_REQUEST) {
        displayToast(response.data.message, ToastType.ERROR);
      } else {
        displayToast(response.message, ToastType.ERROR);
      }
    } catch (error) {
      getLogger().error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Modal
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton={false}
        scrollBehavior="outside"
        classNames={{
          header: "border-b-[1px] border-[#454545]",
        }}
        isDismissable={!isLoading}
      >
        <form onSubmit={onSubmit}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {editMode ? "Edit" : "Add"} Question
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-2">
                      {/* Title fields */}
                      <Input
                        name="title"
                        type="text"
                        label="Title"
                        labelPlacement="outside"
                        placeholder="Enter question title"
                        className="flex-initial"
                        description="Require 3 or more characters"
                        value={title}
                        isRequired
                        onValueChange={setTitle}
                        disabled={isLoading}
                      ></Input>

                      <Select
                        name="complexity"
                        isRequired
                        label="Complexity"
                        labelPlacement="outside"
                        placeholder="Choose a complexity level"
                        className="flex-none w-36"
                        classNames={{
                          value: "capitalize",
                        }}
                        selectedKeys={[complexity]}
                        items={complexitySelections}
                        onChange={(e) => setComplexity(e.target.value)}
                        disabled={isLoading}
                      >
                        {(level) => (
                          <SelectItem className="capitalize" key={level.value}>
                            {level.value.toLowerCase()}
                          </SelectItem>
                        )}
                      </Select>

                      <Select
                        isRequired
                        label="Topics"
                        labelPlacement="outside"
                        placeholder="Select question topics"
                        selectionMode="multiple"
                        description="Allow multiple selections"
                        classNames={{
                          value: "capitalize",
                        }}
                        isMultiline={true}
                        items={topicOptions}
                        selectedKeys={topics}
                        onChange={(e) => setTopics(e.target.value.split(","))}
                        disabled={isLoading}
                      >
                        {topicOptions.map((topic) => (
                          <SelectItem className="capitalize" key={topic}>
                            {topic.toLowerCase()}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex">
                      <Input
                        name="Url"
                        type="url"
                        label="Question Source Url"
                        labelPlacement="outside"
                        placeholder="https://leetcode.com"
                        className="flex"
                        isRequired
                        disabled={isLoading}
                        value={url}
                        onValueChange={setUrl}
                      ></Input>
                    </div>

                    {/* Description, constrain and example fields */}
                    <div className="flex">
                      <QuestionDescription
                        name="description"
                        value={description}
                        onValueChange={setDescription}
                        disabled={isLoading}
                      ></QuestionDescription>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="flex flex-col basis-1/2">
                        <QuestionConstrainsTable
                          value={constraints}
                          onValueChange={(v) => setConstraints(v)}
                          disabled={isLoading}
                        ></QuestionConstrainsTable>
                      </div>
                      <div className="flex flex-col basis-1/2">
                        <QuestionExamplesTable
                          value={examples}
                          onValueChange={(v) => setExamples(v)}
                        ></QuestionExamplesTable>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="relative items-center">
                  <p className="absolute insert-x-0 left-0 py-2 px-4 text-danger">
                    {error}
                  </p>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                    startContent={<FiCornerDownLeft />}
                  >
                    {isLoading ? "Loading..." : "Submit"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </form>
      </Modal>
    </>
  );
}
