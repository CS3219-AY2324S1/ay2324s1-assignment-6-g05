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
import { FiCornerDownLeft } from "react-icons/fi";
import displayToast from "../common/Toast";
import { COMPLEXITY, ToastType } from "@/types/enums";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
import HttpStatusCode from "@/types/HttpStatusCode";
import { getLogger } from "@/helpers/logger";
import { postQuestionLambda } from "@/helpers/question/question_api_wrappers";

export default function LambdaQuestionModal({
    isOpen,
    onOpenChange,
    closeCallback,
}: {
    isOpen: boolean;
    onOpenChange: () => void;
    closeCallback: () => void;
}) {
    // component states
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState("");

    // form arguments
    const [url, setUrl] = useState("");

    // form action
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        console.log("SUBMITTED");
        event.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await postQuestionLambda(url);

            if (response.status === HttpStatusCode.OK) {
                displayToast("Question created.", ToastType.SUCCESS);
                closeCallback();
                setTimeout(() => {
                    location.reload(); // Refresh the page
                }, 3000); // Wait for 3 seconds (3000 milliseconds)
            } else if (response.status === HttpStatusCode.BAD_REQUEST) {
                displayToast("Please check the question again.", ToastType.ERROR);
            } else {
                displayToast("An error has occured", ToastType.ERROR);
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
                                <ModalHeader className="flex flex-col gap-1">Question</ModalHeader>
                                <ModalBody>
                                    <div className="flex flex-col gap-4">
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
