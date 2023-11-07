import { ModalBody, ModalFooter, Button, CircularProgress, Tooltip, ModalHeader } from "@nextui-org/react";
import ComplexityChip from "../question/ComplexityChip";
import { useEffect, useState } from "react";
import Preference from "@/types/preference";
import SocketService from "@/helpers/matching/socket_service";
import { useAuthContext } from "@/contexts/auth";
import { Icons } from "../common/Icons";
import MatchingPreferenceList from "./MatchingPreferenceList";
import { getLogger } from "@/helpers/logger";

export default function MatchingLobbyMatchingView(
    {
        onMatched,
        onNoMatch,
        onClose,
        onError,
        preference
    }: {
        onMatched: (
            isOwner: boolean
        ) => void
        onNoMatch: () => void
        onClose: () => void
        onError: () => void
        preference: Preference
    }
) {
    const { user } = useAuthContext();
    const [ timer, setTimer ] = useState(0);

    const requestMatch = (socket: SocketService) => {
        try {
            socket.requestMatching({
                user: {
                    id: user.id,
                    name: user.name,
                    image: user.image
                },
                preferences: preference
            });
        } catch (error) {
            getLogger().error(error);
            onError();
        }
    }

    useEffect(() => {
        async function initializeSocket() {
            await SocketService.getInstance().then(socket => {
                socket.onMatched(owner => {
                    onMatched(user.id === owner)
                });
                socket.onNoMatched(onNoMatch);
                requestMatch(socket);
            })
        }
        initializeSocket();
    }, [])


    useEffect(() => {
        if (timer > 90) {
            return onNoMatch();
        }
        const clock = setTimeout(() => {
            setTimer(prev => prev + 1);
        }, 1000)

        return () => clearTimeout(clock)
    }, [timer])


    return (
        <>            
        <ModalHeader>
            Looking for a Match
        </ModalHeader>
            <ModalBody className="flex flex-col gap-2 p-2 h-full items-center justify-center">
                <CircularProgress
                    classNames={{
                        svg: "w-24 h-24"
                    }}
                    aria-label="waiting for a match"
                    label={timer + "s"}
                >
                </CircularProgress>
                <MatchingPreferenceList 
                    languages={preference?.languages || []} 
                    topics={preference?.topics || []} 
                    difficulties={preference?.difficulties || []}></MatchingPreferenceList>
            </ModalBody>
            <ModalFooter>
                <Button onPress={onClose} startContent={<Icons.FiX />}>Cancel</Button>
            </ModalFooter>
        </>
    )
}
