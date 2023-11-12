import SocketService from "@/helpers/matching/socket_service";
import { getQuestionByPreference } from "@/helpers/question/question_api_wrappers";
import { useAuthContext } from "@/contexts/auth";
import Question from "@/types/question";
import { Button, Chip, CircularProgress, ModalBody, Tooltip, ModalHeader, Select, SelectItem, ModalFooter } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Icons } from "../common/Icons";
import ComplexityChip from "../question/ComplexityChip";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";

export default function MatchingLobbyPrepCollabView({
    onClose,
    onError
}: {
    onClose: () => void;
    onError: () => void;
}) {
    const user = useAuthContext();
    const [socketService, setSocketService] = useState<SocketService | null>(null);
    const [questionOptions, setQuestionOptions] = useState<Question[]>([]);
    const [languageOptions, setLanguageOptions] = useState<string[]>([]);
    const [question, setQuestion] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>([]);
    const [isLoading, setIsloading] = useState(true);
    const [noQuestion, setNoQuestion] = useState(false);


    const handleStart = () => {
        try {
            if (question[0] === "") {
                displayToast("Please select a question.", ToastType.WARNING);
                return;
            }
            if (language[0] === "") {
                displayToast("Please select a language.", ToastType.WARNING);
                return;
            }
            socketService?.requestStartCollaboration(Array.from(question)[0] || "", language[0]);
            setIsloading(true);
        } catch (error) {
            onError();
        }
    }

    useEffect(() => {
        async function initializeSocket() {
            await SocketService.getInstance().then(async socket => {
                setSocketService(socket);
                const preference = socket.getRoomPreference() ?? user.user.preferences;
                if (preference?.languages) {
                    setLanguageOptions(preference.languages)
                }

                await getQuestionByPreference(preference).then(questions => {
                    if (questions.length > 0) {
                        setQuestionOptions(questions);
                        setIsloading(false);
                    } else {
                        setNoQuestion(true)
                    }
                }).catch(err => {
                    onError()
                })
            }).catch(err => {
                onError()
            })

        }
        initializeSocket();
    }, [onError, user.user.preferences])

    useEffect(() => {
        if (questionOptions.length > 0) {
            setQuestion([questionOptions[0].id!])
        }
        if (languageOptions.length > 0) {
            setLanguage([languageOptions[0]])
        }
        if (questionOptions.length === 1 && languageOptions.length === 1) {
            setIsloading(true);
            socketService?.requestStartCollaboration(questionOptions[0].id!, languageOptions[0]);
        }
    }, [questionOptions, languageOptions, isLoading])

    return (
        <>
            <ModalHeader>
                {noQuestion 
                    ? (<>No Questions Available</>) 
                    : (<>Setting up Peerprep</>)
                }
            </ModalHeader>
            <ModalBody className="p-4 px-6">
                <div className="flex flex-col gap-2 items-center justify-center">
                    {!isLoading &&
                        <div className="flex flex-row items-end gap-2 w-full">
                            {languageOptions.length > 1 && !noQuestion &&
                                <Select
                                    label="Language"
                                    labelPlacement="outside"
                                    placeholder="language"
                                    selectedKeys={language}
                                    classNames={{
                                        value: "capitalize",
                                    }}
                                    className={questionOptions.length > 1 ? "basis-1/3" : "basis-3/3"}
                                    onChange={e => setLanguage([e.target.value])}
                                >
                                    {languageOptions.map(lang => <SelectItem key={lang} value={lang} className="capitalize">{lang.toLowerCase()}</SelectItem>)}
                                </Select>
                            }
                            {questionOptions.length > 1 &&
                                <Select
                                    label="Select a question for Peerprep"
                                    labelPlacement="outside"
                                    placeholder="question"
                                    selectedKeys={question}
                                    className={languageOptions.length > 1 ? "basis-2/3" : "basis-3/3"}
                                    onChange={e => setQuestion([e.target.value])}
                                >
                                    {questionOptions.map(question => <SelectItem key={question.id || "-1"} textValue={question.title || "-1"}>
                                        <div className="flex flex-col gap-1">
                                            <div>
                                                {question.title}
                                            </div>
                                            <Tooltip className="capitalize" content={question.topics.join(", ").toLowerCase()} isDisabled={question.topics.length < 3}>
                                                <div className="flex flex-row gap-1 overflow-x-hidden text-sm">
                                                    <ComplexityChip complexity={question.complexity} size="sm"></ComplexityChip>
                                                    {question.topics.map(t => (
                                                        <Chip key={t} className="capitalize" size="sm">{t.toLowerCase()}</Chip>
                                                    ))}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </SelectItem>)}
                                </Select>
                            }
                        </div>
                    }
                    {isLoading && !noQuestion &&
                        <CircularProgress
                            classNames={{
                                svg: "w-24 h-24"
                            }} aria-label="Setting up collaboration session">
                        </CircularProgress>
                    }
                    {noQuestion &&
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Icons.FiX className="w-24 h-24  text-danger" />
                            <p>Sorry, unable to find suitable questions, please change your preference.</p>
                            <Button onPress={onClose}>Ok</Button>
                        </div>
                    }
                </div>
            </ModalBody>
            {!isLoading && (questionOptions.length > 1 || languageOptions.length > 1) && !noQuestion &&
                <ModalFooter className="px-6">
                    <Button onPress={handleStart} color="primary" startContent={<Icons.FiPlay />}>Confirm</Button>
                </ModalFooter>
            }
        </>
    )
}
