"use client";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import ChatBubble from "./ChatBubble";
import { Button, Divider, Tooltip } from "@nextui-org/react";
import ProfilePictureAvatar from "@/components/common/ProfilePictureAvatar";
import { useCollabContext } from "@/contexts/collab";
import ChatMessage from "@/types/chat_message";
import { Icons } from "@/components/common/Icons";

interface IChatSpaceProps {
  toggleLeft: boolean;
  setToggleLeft: React.Dispatch<React.SetStateAction<boolean>>;
  unreadMessages: number;
  setUnreadMessages: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSpace = ({
  toggleLeft,
  setToggleLeft,
  unreadMessages,
  onClose,
  setUnreadMessages,
  isOpen,
}: IChatSpaceProps) => {
  const { partner, user, socketService } = useCollabContext();

  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerConnected, setIsPartnerConnected] = useState<boolean>(false);
  const [newMessage, setNewMessages] = useState<ChatMessage>({
    content: "",
    senderId: "",
  });

  const scrollToNewestMessage = () => {
    setTimeout(() => {
      scrollTargetRef!.current!.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setUnreadMessages(unreadMessages + 1);
    }
  }, [newMessage]);

  useEffect(() => {
    if (isOpen) {
      setUnreadMessages(0);
    }
  }, [isOpen]);

  useEffect(() => {
    socketService?.updateChatMessages(setNewMessages);
    socketService?.receiveChatList(setMessages);
    socketService?.receivePartnerConnection(setIsPartnerConnected);
  }, []);

  useEffect(() => {
    if (newMessage.content !== "" && newMessage.senderId !== user!.id) {
      setMessages([...messages, newMessage]);
      scrollToNewestMessage();
    }
  }, [newMessage]);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isPartnerConnected) return;

    e.preventDefault();

    const messageContent = e.currentTarget.message.value;
    if (!messageContent) {
      return;
    }

    const message = {
      content: messageContent,
      senderId: user!.id!,
    };

    setMessages([...messages, message]);
    socketService!.sendChatMessage(message);

    e.currentTarget.message.value = "";
    scrollToNewestMessage();
  };

  const handleToggleLeft = () => {
    setToggleLeft(!toggleLeft);
  };

  return (
    <div className={`bg-black rounded-xl w-[400px] p-2`}>
      <div className="flex w-full justify-between mb-2">
        <div className="flex items-center gap-2">
          <ProfilePictureAvatar profileUrl={partner!.image!} isChatAvatar />

          <span className="font-semibold text-sm"> {partner!.name} </span>
        </div>
        <div>
          <Tooltip
            content={
              toggleLeft ? "Move chat to the right" : "Move chat to the left"
            }
          >
            <Button isIconOnly variant="light" onPress={handleToggleLeft}>
              <Icons.HiSwitchHorizontal />
            </Button>
          </Tooltip>
          <Button isIconOnly variant="light" onPress={onClose}>
            <Icons.RxCross2 />
          </Button>
        </div>
      </div>
      <Divider />

      <div className="py-8 text-base leading-7 text-gray-600 h-[400px] overflow-y-auto">
        <div style={{ display: messages.length === 0 ? "block" : "none" }}>
          <div className="text-center text-gray-400 text-sm">
            No messages yet, send one now!
          </div>
        </div>
        {
          <ul className="space-y-3 px-4">
            {messages.map((item) => (
              <ChatBubble
                key={crypto.randomUUID()}
                message={item}
                isSelf={item.senderId === user!.id!}
              />
            ))}
          </ul>
        }
        <div ref={scrollTargetRef}></div>
      </div>
      <form
        onSubmit={handleSubmitMessage}
        className="p-4 flex gap-2 text-base font-semibold leading-7"
      >
        <input
          id="message"
          placeholder="Message"
          autoComplete="off"
          className="px-2 py-2  rounded-md flex-1 font-light text-sm focus:outline-none focus:bg-zinc-800"
        />
        <button
          className={
            isPartnerConnected
              ? "bg-yellow px-2.5 rounded-md text-black hover:bg-amber-200  active:bg-white"
              : "bg-yellow px-2.5 rounded-md text-black text-opacity-30 cursor-not-allowed"
          }
          disabled={!isPartnerConnected}
        >
          <Icons.BsSendFill />
        </button>
      </form>
    </div>
  );
};

export default ChatSpace;
