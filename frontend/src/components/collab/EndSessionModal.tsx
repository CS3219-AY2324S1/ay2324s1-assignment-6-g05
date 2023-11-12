"use client";

import { CLIENT_ROUTES } from "@/common/constants";
import { useAuthContext } from "@/contexts/auth";
import { useCollabContext } from "@/contexts/collab";
import { HistoryService } from "@/helpers/history/history_api_wrappers";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import displayToast from "../common/Toast";
import { getLogger } from "@/helpers/logger";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasSessionTimerEnded: boolean;
}

export default function EndSessionModal({
  isOpen,
  onClose,
  hasSessionTimerEnded,
}: EndSessionModalProps) {
  const router = useRouter();

  const { user } = useAuthContext();

  const { socketService } = useCollabContext();

  const [isSaving, setIsSaving] = useState(false);
  const [endSessionState, setEndSessionState] = useState({
    partnerId: "",
    questionId: "",
    matchedLanguage: "",
    code: "",
    date: new Date(),
  });

  useEffect(() => {
    if (socketService) {
      // Ping to get details to end session:
      if (isOpen) {
        socketService.endSession();
      }
      // Retrieve current state before ending session
      socketService.receiveEndSession(setEndSessionState);
    }
  }, [isOpen, socketService]);

  const postToHistoryService = async () => {
    // in case of error, show 500 page
    if (!endSessionState.code || endSessionState.code === "") {
      displayToast(
        "As no code modification is detected, the session is not saved."
      );
      return;
    }

    await HistoryService.postToHistoryService(
      user.id!,
      endSessionState.questionId,
      endSessionState.matchedLanguage,
      endSessionState.code
    );
  };

  const handleTerminateSession = async () => {
    setIsSaving(true);

    if (socketService) {
      socketService.sendConfirmEndSession();
    }

    try {
      await postToHistoryService();
      onClose();
      router.push(CLIENT_ROUTES.HOME);
    } catch (error) {
      getLogger().error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal size="sm" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              {hasSessionTimerEnded ? (
                <>
                  <ModalHeader>Session has expired</ModalHeader>
                  <Divider className="mb-1" />
                  <ModalBody>
                    <p>Your session has ended. Thank you for using PeerPrep!</p>
                  </ModalBody>
                  <ModalFooter className="mt-2">
                    <Button color="danger" onClick={handleTerminateSession}>
                      Back to dashboard
                    </Button>
                  </ModalFooter>
                </>
              ) : (
                <>
                  <ModalHeader>Terminate current session</ModalHeader>
                  <Divider className="mb-1" />
                  <ModalBody>
                    <p>
                      Are you sure you want to exit the current sesion? This
                      action is irreversible.
                    </p>
                  </ModalBody>
                  <ModalFooter className="mt-2">
                    <Button color="primary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      isLoading={isSaving}
                      color="danger"
                      onClick={handleTerminateSession}
                    >
                      {isSaving ? <>Saving</> : <>Terminate</>}
                    </Button>
                  </ModalFooter>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}