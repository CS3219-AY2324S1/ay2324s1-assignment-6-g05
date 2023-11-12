"use client";

import { useEffect, useState } from "react";
import { Icons } from "../common/Icons";
import { Badge, Button, Code, Spacer, useDisclosure } from "@nextui-org/react";
import CodeEditorNavBarTooltip from "./CodeEditorNavBarTooltip";
import ProfilePictureAvatar from "../common/ProfilePictureAvatar";
import Timer from "./Timer";
import EndSessionModal from "./EndSessionModal";
import { useCollabContext } from "@/contexts/collab";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";

interface CodeEditorNavbarProps {
  handleResetToDefaultCode: () => void;
}

const CodeEditorNavbar = ({
  handleResetToDefaultCode,
}: CodeEditorNavbarProps) => {
  const defaultDate = new Date(2023, 9, 8, 14, 30, 0, 0);

  const { partner, matchedLanguage, isSocketConnected, socketService } =
    useCollabContext();
  const language = matchedLanguage || "";
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPartnerConnected, setIsPartnerConnected] = useState<boolean>(false);
  const [hasPartnerLeft, setHasPartnerLeft] = useState<boolean>(false);
  const [hasSessionTimerEnded, setHasSessionTimerEnded] =
    useState<boolean>(false);
  const [sessionEndTime, setSessionEndTime] = useState<Date>(defaultDate);
  const [receivedSessionEndTime, setReceivedSessionEndTime] =
    useState<boolean>(false);

  const handleFullScreen = () => {
    if (isFullScreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  const getTimer = () => {
    const currentTime = new Date();
    return Math.floor(
      (sessionEndTime.getTime() - currentTime.getTime()) / 1000
    );
  };

  // Check for session timer
  useEffect(() => {
    if (!socketService) return;

    if (getTimer() >= 0) {
      setReceivedSessionEndTime(true);
    } else {
      socketService.sendGetSessionTimer();
    }

    socketService.receiveSessionTimer(setSessionEndTime);
  }, [socketService, sessionEndTime]);

  useEffect(() => {
    if (socketService) {
      socketService.receivePartnerConnection(setIsPartnerConnected);
      socketService.receiveHasPartnerLeft(setHasPartnerLeft);
    }
  }, [socketService]);

  useEffect(() => {
    function exitHandler(e: any) {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        return;
      }
      setIsFullScreen(true);
    }

    if (document.addEventListener) {
      document.addEventListener("fullscreenchange", exitHandler);
      document.addEventListener("webkitfullscreenchange", exitHandler);
      document.addEventListener("mozfullscreenchange", exitHandler);
      document.addEventListener("MSFullscreenChange", exitHandler);
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (partner && receivedSessionEndTime) {
      setIsReady(true);
    }
  }, [partner, receivedSessionEndTime]);

  useEffect(() => {
    if (!isReady) return;

    if (hasPartnerLeft) {
      displayToast(
        "Your partner has terminated his session. The session will remain active until you are done.",
        ToastType.INFO
      );
      return;
    }

    if (isPartnerConnected) {
      displayToast("Your partner has connected.", ToastType.SUCCESS);
    } else {
      displayToast("Your partner has disconnected.", ToastType.WARNING);
    }
  }, [isPartnerConnected]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const setSessionEnded = () => {
    setHasSessionTimerEnded(true);
    onOpen();
  };

  return (
    <div className="flex items-center justify-between h-11 w-full">
      <div className="flex items-center m-4">
        <div className="text-lg">
          <Icons.BsFileEarmarkCode />
        </div>
        <CodeEditorNavBarTooltip content={`Code using ${language}`}>
          <Code className="text-sm bg-gray-400 bg-opacity-50 mx-2 text-opacity-80 capitalize">
            {language}
          </Code>
        </CodeEditorNavBarTooltip>

        <div className="m-1">
          {isSocketConnected ? (
            <CodeEditorNavBarTooltip content="Connected">
              <div>
                <Icons.MdSignalWifiStatusbar4Bar />
              </div>
            </CodeEditorNavBarTooltip>
          ) : (
            <CodeEditorNavBarTooltip content="Disconnected">
              <div>
                <Icons.MdSignalWifiConnectedNoInternet0 />
              </div>
            </CodeEditorNavBarTooltip>
          )}
        </div>
      </div>

      <div className="flex justify-start items-center">

      {isReady ? (
        <CodeEditorNavBarTooltip content="Click to toggle time">
          <div>
            <Timer
              setSessionEnded={setSessionEnded}
              timeDifference={getTimer()}
            />
          </div>
        </CodeEditorNavBarTooltip>
      ) : (
        <></>
      )}
      </div>

      {/* Buttons for some interaction */}
      <div className="flex items-center m-2">
        <div>
        {/* Show partner avatar */}
        {partner?.name ? (
          <div className="flex items-center justify-end m-2">
            <CodeEditorNavBarTooltip
              content={isPartnerConnected ? partner.name : "Partner Disconnected"}
            >
              <div className="mt-1">
                {isPartnerConnected ? (
                  <Badge
                    content=""
                    color="success"
                    shape="circle"
                    placement="bottom-right"
                    size="sm"
                    variant="solid"
                    isInvisible={!isPartnerConnected}
                  >
                    <ProfilePictureAvatar
                      profileUrl={partner.image!}
                      isChatAvatar
                    />
                  </Badge>
                ) : (
                  <Icons.FaUserSlash />
                )}
              </div>
            </CodeEditorNavBarTooltip>
          </div>
        ) : (
          <></>
        )}
        </div>
        <div className="mx-1">
          <CodeEditorNavBarTooltip content="Reset to default code definition">
            <Button
              size="sm"
              isIconOnly={true}
              onClick={handleResetToDefaultCode}
            >
              <Icons.RxReset color="white" />
            </Button>
          </CodeEditorNavBarTooltip>
        </div>

        <div className="mx-1">
          <CodeEditorNavBarTooltip content="Full Screen">
            <Button size="sm" isIconOnly={true} onClick={handleFullScreen}>
              {!isFullScreen ? (
                <Icons.BiFullscreen />
              ) : (
                <Icons.BiExitFullscreen />
              )}
            </Button>
          </CodeEditorNavBarTooltip>
        </div>

        <div className="mx-1">
          <CodeEditorNavBarTooltip content="End the session">
            <Button
              size="sm"
              radius="sm"
              onClick={onOpen}
              className="bg-red-600 font-medium"
            >
              End Session
            </Button>
          </CodeEditorNavBarTooltip>
          <EndSessionModal
            onClose={onClose}
            isOpen={isOpen}
            hasSessionTimerEnded={hasSessionTimerEnded}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorNavbar;
