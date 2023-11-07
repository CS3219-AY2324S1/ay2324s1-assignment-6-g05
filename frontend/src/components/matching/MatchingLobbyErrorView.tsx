import { ModalBody, ModalFooter, Button, ModalHeader } from "@nextui-org/react";
import { Icons } from "../common/Icons";


export default function MatchingLobbyErrorView(
    {
        onClose
    }: {
        onClose: () => void
    }
) {
    return (
        <>
            <ModalHeader>
                Connection lost
            </ModalHeader>
            <ModalBody className="flex flex-col gap-2 p-4 h-full items-center justify-center">
                <Icons.FiWifiOff className="w-24 h-24  text-danger" />
                <p>Please try again later.</p>
            </ModalBody>
            <ModalFooter>
                <Button onPress={onClose}>Ok</Button>
            </ModalFooter>
        </>
    )
}