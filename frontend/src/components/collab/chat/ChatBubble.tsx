import ChatMessage from "@/types/chat_message";

interface ChatBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
}

const ChatBubble = ({ message, isSelf }: ChatBubbleProps) => {
  return (
    <li
      className={`flex items-center ${isSelf ? "ml-10 justify-end" : "mr-10"}`}
    >
      <p
        className={`${
          isSelf
            ? "bg-yellow text-black text-sm"
            : "bg-zinc-800 text-white text-sm"
        } p-2 rounded-md`}
      >
        {message.content}
      </p>
    </li>
  );
};

export default ChatBubble;
