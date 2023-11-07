"use client";

import Workspace from "@/components/collab/Workspace";
import { useEffect, useState } from "react";
import { useCollabContext } from "@/contexts/collab";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import ChatSpaceToggle from "@/components/collab/chat/ChatSpaceToggle";
import { notFound, useSearchParams } from "next/navigation";

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const partnerId = searchParams.get("partnerId")!;
  const questionId = searchParams.get("questionId")!;
  const language = searchParams.get("language")!;
  const [roomNotFound, setRoomNotFound] = useState(false);

  const {
    socketService,
    handleConnectToRoom,
    handleDisconnectFromRoom,
    isLoading,
    isNotFoundError,
  } = useCollabContext();

  useEffect(() => {
    if (!socketService) {
      handleConnectToRoom(roomId, questionId, partnerId, language);
    }

    if (socketService) socketService?.receiveRoomNotFound(setRoomNotFound);

    if (isNotFoundError || roomNotFound) {
      return notFound();
    }

    return () => {
      if (socketService) {
        handleDisconnectFromRoom();
      }
    };
  }, [socketService, roomNotFound]);

  return (
    <div>
      {isLoading && !socketService ? (
        <LogoLoadingComponent />
      ) : (
        <>
            <Workspace />
            <ChatSpaceToggle />
        </>
      )}
    </div>
  );
};
