import {
  ModalBody,
  Card,
  CardBody,
  CardFooter,
  Button,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import ProfilePictureAvatar from "../common/ProfilePictureAvatar";
import { useEffect, useState } from "react";
import Partner from "@/types/partner";
import { useAuthContext } from "@/contexts/auth";
import { Icons } from "../common/Icons";
import SocketService from "@/helpers/matching/socket_service";
import Preference from "@/types/preference";
import MatchingPreferenceList from "./MatchingPreferenceList";

export type MatchingSuccessState = {
  userReady: boolean;
  partner: Partner;
  partnerReady: boolean;
  partnerLeft: boolean;
  owner: boolean;
};

export default function MatchingLobbySuccessView({
  isOwner,
  onStart,
  onCancel,
  onRematch,
}: {
  isOwner: boolean;
  onStart: () => void;
  onCancel: () => void;
  onRematch?: () => void;
}) {
  const { user } = useAuthContext();
  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [userReady, setUserReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [preference, setPreference] = useState<Preference | null>(null);
  const [timer, setTimer] = useState<number>(10);

  const onUserReady = (ready: boolean) => {
    setUserReady(ready);
    socketService?.notifyUserReadyChange(ready);
  };

  useEffect(() => {
    async function initializeSocket() {
      await SocketService.getInstance().then((socket) => {
        setSocketService(socket);

        setPreference(socket.getRoomPreference());
        setPartner(socket.getRoomPartner());
        socket.onRoomClosed(() => setPartnerLeft(true));
        socket.onPartnerReadyChange((ready) => setPartnerReady(ready));
      });
    }
    initializeSocket();
  }, []);

  // useEffect(() => {
  //   if (userReady && partnerReady && isOwner) {
  //     // start countdown
  //     setTimer(timer - 1);
  //   }
  // }, [userReady, partnerReady])

  useEffect(() => {
    if (timer === 0) {
      onStart();
    }

    const clock = setTimeout(() => {
      if (userReady && partnerReady && isOwner) {
        setTimer((prev) => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(clock);
  }, [userReady, partnerReady, isOwner, timer, onStart]);

  return (
    <>
      <ModalHeader>
        <span>Matched</span>
      </ModalHeader>
      <ModalBody className="flex flex-col gap-4 items-center p-2">
        <div className="flex flex-row gap-2 items-center justify-center">
          <Card className="flex-1">
            <CardBody className="items-center p-2 ">
              <ProfilePictureAvatar isMatchingAvatar profileUrl={user.image!} />
              <p className="w-24 truncate text-center">{user.name}</p>
            </CardBody>
            <CardFooter className="justify-center p-2">
              <Button
                onPress={(e) => onUserReady(!userReady)}
                color={userReady ? "success" : "primary"}
                className="w-full"
                startContent={
                  userReady ? <Icons.FiThumbsUp /> : <Icons.FiPlay />
                }
                isDisabled={userReady || partnerLeft}
              >
                {userReady ? "Ready" : "Start"}
              </Button>
            </CardFooter>
          </Card>
          <div className="text-center">
            <Icons.FiCodepen className="m-4 w-12 h-12" />
          </div>
          <Card className="flex-1">
            <CardBody className="items-center p-2">
              <ProfilePictureAvatar
                isMatchingAvatar
                profileUrl={partner?.image!}
              />
              <p className="w-24 truncate text-center">{partner?.name}</p>
            </CardBody>
            <CardFooter className="justify-center p-2">
              {!partnerLeft && (
                <Button
                  color={partnerReady ? "success" : "warning"}
                  className="w-full"
                  isLoading={!partnerReady}
                  isDisabled
                  startContent={partnerReady ? <Icons.FiThumbsUp /> : <></>}
                >
                  {partnerReady ? "Ready" : "Waiting"}
                </Button>
              )}
              {partnerLeft && (
                <Button
                  color="danger"
                  className="w-full"
                  isDisabled
                  startContent={<Icons.FiX />}
                >
                  Left
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        <MatchingPreferenceList
          languages={preference?.languages || []}
          topics={preference?.topics || []}
          difficulties={preference?.difficulties || []}
        ></MatchingPreferenceList>
      </ModalBody>
      <ModalFooter>
        {(!userReady || !partnerReady || partnerLeft) && (
          <Button onPress={onCancel} startContent={<Icons.FiX />}>
            Cancel
          </Button>
        )}
        {partnerLeft && (
          <Button
            onPress={onRematch}
            color="warning"
            startContent={<Icons.RxReset />}
          >
            Rematch
          </Button>
        )}
        {isOwner && userReady && partnerReady && !partnerLeft && (
          <Button
            onPress={onStart}
            color="primary"
            startContent={<Icons.FiPlay />}
          >
            Start Peerprep ({timer})
          </Button>
        )}
        {!isOwner && userReady && partnerReady && !partnerLeft && (
          <Button color="primary" isLoading>
            Waiting for {isOwner ? user.name : partner?.name} to start
          </Button>
        )}
      </ModalFooter>
    </>
  );
}
