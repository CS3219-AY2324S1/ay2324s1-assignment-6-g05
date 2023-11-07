"use client";
import { getLogger } from "@/helpers/logger";
import { Modal, ModalContent } from "@nextui-org/react";
import { useEffect, useState } from "react";
import MatchingLobbyErrorView from "./MatchingLobbyErrorView";
import MatchingLobbyMatchingView from "./MatchingLobbyMatchingView";
import MatchingLobbyNoMatchView from "./MatchingLobbyNoMatchView";
import MatchingLobbySuccessView from "./MatchingLobbySuccessView";
import { MATCHING_STAGE, SocketEvent } from "@/types/enums";
import SocketService from "@/helpers/matching/socket_service";
import MatchingLobbyPrepCollabView from "./MatchingLobbyPrepCollabView";
import { useRouter } from "next/navigation";
import { CLIENT_ROUTES } from "@/common/constants";
import MatchingLobbyInitialView from "./MatchingLobbyInitialView";

export default function MatchingLobby({
  isOpen,
  onClose,
  options = {
    languages: [],
    difficulties: [],
    topics: [],
  },
}: {
  isOpen: boolean;
  onClose: () => void;
  options: {
    languages: string[];
    difficulties: string[];
    topics: string[];
  };
}) {
  const router = useRouter();
  const logger = getLogger("matching");
  const [stage, setStage] = useState(MATCHING_STAGE.INITIAL);
  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [isRoomOwner, setIsRoomOwner] = useState(false);

  /////////////////////////////////////////////
  // Stage fired events
  /////////////////////////////////////////////
  const initializeSocket = async () => {
    try {
      socketService?.off(SocketEvent.DISCONNECT);
      socketService?.disconnect();

      await SocketService.getInstance().then((socket) => {
        setSocketService(socket);
        socket.onConnect(() => setStage(MATCHING_STAGE.MATCHING));
        socket.onDisconnect(() => setStage(MATCHING_STAGE.ERROR));
        socket.onConnectError(() => setStage(MATCHING_STAGE.ERROR));
        // Handles redirect command from the server
        socket.onRedirectCollaboration((room) => handleRedirect(socket, room));
      });
    } catch (error) {
      logger.error(error);
      setStage(MATCHING_STAGE.ERROR);
    }
  };

  /////////////////////////////////////////////
  // Server fired events
  /////////////////////////////////////////////
  const handleMatched = (isOwner: boolean) => {
    setIsRoomOwner(isOwner);
    setStage(MATCHING_STAGE.SUCCESS);
  };

  const handleRedirect = (socket: SocketService, room: any) => {
    const partnerId = socket.getRoomPartner()!.id;
    const path = `${CLIENT_ROUTES.COLLABORATION}/${
      room.id
    }?partnerId=${partnerId}&questionId=${
      room.questionId
    }&language=${encodeURIComponent(room.language)}`;
    onClose();
    socket.disconnect();
    router.push(path);
  };

  /////////////////////////////////////////////
  // User fired events
  /////////////////////////////////////////////
  const handleClose = () => {
    socketService?.disconnect();
    onClose();
  };

  /////////////////////////////////////////////
  // Modal views
  /////////////////////////////////////////////

  const renderView = (stage: MATCHING_STAGE) => {
    switch (stage) {
      case MATCHING_STAGE.INITIAL:
        return (<MatchingLobbyInitialView
          onClose={handleClose}
          onError={() => setStage(MATCHING_STAGE.ERROR)}
        />);
      case MATCHING_STAGE.MATCHING:
        return (
          <MatchingLobbyMatchingView
            onMatched={handleMatched}
            onNoMatch={() => setStage(MATCHING_STAGE.FAIL)}
            onClose={handleClose}
            onError={() => setStage(MATCHING_STAGE.ERROR)}
            preference={options}
          />
        );
      case MATCHING_STAGE.SUCCESS:
        return (
          <MatchingLobbySuccessView
            isOwner={isRoomOwner}
            onStart={() => setStage(MATCHING_STAGE.START)}
            onCancel={handleClose}
            onRematch={() => setStage(MATCHING_STAGE.MATCHING)}
          />
        );
      case MATCHING_STAGE.START:
        return (
          <MatchingLobbyPrepCollabView
            onClose={handleClose}
            onError={() => setStage(MATCHING_STAGE.ERROR)}
          />
        );
      case MATCHING_STAGE.FAIL:
        return (
          <MatchingLobbyNoMatchView
            onClose={handleClose}
            onRetry={() => setStage(MATCHING_STAGE.MATCHING)}
          />
        );
      default:
        return <MatchingLobbyErrorView onClose={handleClose} />;
    }
  };

  /////////////////////////////////////////////
  // React hooks
  /////////////////////////////////////////////
  useEffect(() => {
    if (isOpen) {
      if (stage === MATCHING_STAGE.INITIAL) {
        initializeSocket();
      }
    } else {
      setStage(MATCHING_STAGE.INITIAL);
    }
  }, [isOpen, stage]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        isDismissable={false}
        hideCloseButton
        size="md"
        classNames={{
          base: "h-fit",
          body: "p-4",
          footer: "p-4",
        }}
      >
        <ModalContent>{() => <>{renderView(stage)}</>}</ModalContent>
      </Modal>
    </>
  );
}
