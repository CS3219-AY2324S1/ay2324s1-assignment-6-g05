import { Button, CircularProgress, ModalBody, ModalHeader } from "@nextui-org/react";
import { useEffect } from "react";

export default function MatchingLobbyInitialView({
    onClose,
    onError
}: {
    onClose: () => void;
    onError: () => void;
}) {

    return (
        <>
            <ModalHeader>
                Starting a Match
            </ModalHeader>
            <ModalBody className="p-4 px-6 justify-center items-center gap-4">
                <CircularProgress
                    classNames={{
                        svg: "w-24 h-24"
                    }} aria-label="Setting up collaboration session">
                </CircularProgress>
                <Button onPress={onClose}>Cancel</Button>
            </ModalBody>
        </>
    )
}
