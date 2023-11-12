import { Button, Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import { BsChatSquareDotsFill } from "react-icons/bs";
import ChatSpace from "./ChatSpace";
import { useState } from "react";
import { Badge } from "@nextui-org/react";

const ChatSpaceToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(-1);
  const [toggleLeft, setToggleLeft] = useState(false);

  const onToggle = () => setIsOpen(!isOpen);

  const onClose = () => setIsOpen(false);

  return (
    <div className={toggleLeft ? "absolute left-6 bottom-6" : "absolute right-6 bottom-6"}>
      <div style={{ display: isOpen ? "block" : "none" }}>
        <ChatSpace toggleLeft={toggleLeft} setToggleLeft={setToggleLeft} unreadMessages={unreadMessages} setUnreadMessages={setUnreadMessages} isOpen={isOpen} onClose={onClose} />
      </div>
      <div className={toggleLeft ? "flex w-full justify-start mt-3" : "flex w-full justify-end mt-3"}>
        <Badge isInvisible={unreadMessages <= 0} content={unreadMessages} shape="circle" color="danger">
          <Button
            isIconOnly
            className="rounded-full bg-yellow hover:bg-amber-200 active:bg-white"
            size="lg"
            onPress={onToggle}
          >
            <BsChatSquareDotsFill className="text-xl text-black" />
          </Button>
        </Badge>
      </div>
    </div>
  );
};

export default ChatSpaceToggle;
