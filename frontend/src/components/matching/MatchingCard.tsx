"use client";
import { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { COMPLEXITY, LANGUAGE, ToastType } from "@/types/enums";
import MatchingLobby from "./MatchingLobby";
import { useAuthContext } from "@/contexts/auth";
import Preference from "@/types/preference";
import displayToast from "../common/Toast";
import { Icons } from "../common/Icons";
import { useTopicContext } from "@/contexts/topic";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";

const MatchingCard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    user: { preferences: currentPreferences },
  } = useAuthContext();

  const { topics, fetchTopics } = useTopicContext();

  const optionsLanguages = Object.values(LANGUAGE);
  const optionsDifficulties = Object.values(COMPLEXITY);
  const [optionsTopics, setOptionsTopics] = useState<string[]>([]);

  const [preferences, setPreferences] = useState<Preference>({
    languages: [],
    difficulties: [],
    topics: [],
  });

  const handleOnSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === "") {
      setPreferences({
        ...preferences,
        [event.target.name]: [],
      });
    } else {
      setPreferences({
        ...preferences,
        [event.target.name]: event.target.value.split(","),
      });
    }
  };

  const handleGetMatched = () => {
    if (Object.values(preferences).some((x) => x.length == 0)) {
      displayToast(`Invalid matching options.`, ToastType.ERROR);
    } else {
      onOpen();
    }
  };

  const handleReset = () => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  };

  useEffect(() => {
    if (topics.length === 0) {
      fetchTopics();
    }
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }

    if (optionsTopics.length === 0) {
      setOptionsTopics(topics);
    }
  }, [topics]);

  return (
    <Card className="flex flex-col h-full bg-black rounded-lg text-sm overflow-hidden p-2">
      <CardHeader className="p-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-base mt-2">Find a pair programmer</span>
          <span>
            <Tooltip content="Reset preferences">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleReset}
              >
                <Icons.RxReset />
              </Button>
            </Tooltip>
          </span>
        </div>
      </CardHeader>
      {optionsTopics.length === 0 ? (
        <CardBody>
          <SpinnerLoadingComponent />
        </CardBody>
      ) : (
        <>
          <CardBody className="flex flex-col gap-4 p-2">
            <Select
              isRequired
              size="sm"
              name="languages"
              label="Programming languages"
              selectionMode="multiple"
              placeholder="Select a language"
              classNames={{
                value: "capitalize",
              }}
              selectedKeys={preferences.languages}
              onChange={handleOnSelectionChange}
              errorMessage={
                preferences.languages.length == 0 && (
                  <span>Language is required</span>
                )
              }
            >
              {optionsLanguages.map((value) => (
                <SelectItem className="capitalize" key={value} value={value}>
                  {value.toLowerCase()}
                </SelectItem>
              ))}
            </Select>

            <Select
              isRequired
              size="sm"
              name="difficulties"
              label="Complexity"
              selectionMode="multiple"
              placeholder="Select a complexity level"
              classNames={{
                value: "capitalize",
              }}
              selectedKeys={preferences.difficulties}
              onChange={handleOnSelectionChange}
              errorMessage={
                preferences.difficulties.length == 0 && (
                  <span>Difficulty is required</span>
                )
              }
            >
              {optionsDifficulties.map((value) => (
                <SelectItem className="capitalize" key={value} value={value}>
                  {value.toLowerCase()}
                </SelectItem>
              ))}
            </Select>

            <Select
              isRequired
              size="sm"
              name="topics"
              label="Topics"
              selectionMode="multiple"
              placeholder="Select a topic"
              classNames={{
                value: "capitalize",
              }}
              selectedKeys={preferences.topics}
              onChange={handleOnSelectionChange}
              errorMessage={
                preferences.topics.length == 0 && <span>Topics is required</span>
              }
            >
              {optionsTopics.map((value) => (
                <SelectItem className="capitalize" key={value} value={value}>
                  {value.toLowerCase()}
                </SelectItem>
              ))}
            </Select>
            <div className="flex flex-row gap-1 text-xs items-center text-slate-400">
                <Icons.HiOutlineLightBulb size={15} />
                <p>Tip: You can change your default <span className="text-yellow">preference</span> in user profile.</p>
            </div>
          </CardBody>
          <CardFooter>
            <Button className="bg-yellow text-black w-full" onPress={handleGetMatched}>
              Get Matched
            </Button>
            <MatchingLobby
              isOpen={isOpen}
              onClose={onClose}
              options={preferences}
            ></MatchingLobby>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default MatchingCard;
