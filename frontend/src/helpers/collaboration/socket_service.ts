"use strict";
import ChatMessage from "@/types/chat_message";
import { SocketEvent } from "@/types/enums";
import { SetStateAction } from "react";
import { Socket, io } from "socket.io-client";
import { getCollaborationSocketConfig } from "./collaboration_api_wrappers";
import { Position, Range } from "monaco-editor";
import { notFound } from "next/navigation";

class SocketService {
  static instance: SocketService;
  private socket: Socket;
  private userId: string;
  private roomId: string;
  private partnerId: string;
  private questionId: string;
  private language: string;

  constructor(
    userId: string,
    roomId: string,
    endpoint: string,
    path: string,
    partnerId: string,
    questionId: string,
    language: string
  ) {
    this.userId = userId;
    this.roomId = roomId;
    this.partnerId = partnerId;
    this.questionId = questionId;
    this.language = language;
    this.socket = io(endpoint, { path: path, transports: ["polling"] });
    this.socket.connect();
    this.joinRoom();
  }

  public async getInstance(
    userId: string,
    roomId: string,
    partnerId: string,
    questionId: string,
    language: string
  ): Promise<SocketService> {
    if (!SocketService.instance) {
      let config = await getCollaborationSocketConfig();
      SocketService.instance = new SocketService(
        userId,
        roomId,
        config.endpoint,
        config.path,
        partnerId,
        questionId,
        language
      );
    }
    return SocketService.instance;
  }

  createSocket = (endpoint: string, path: string) => {
    return io(endpoint, { path: path });
  };

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.socket.connected;
  }

  joinRoom = () => {
    var sessionEnd = new Date();
    sessionEnd.setHours(sessionEnd.getHours() + 1); // 1 hour from now

    this.socket.emit(SocketEvent.JOIN_ROOM, {
      userId: this.userId,
      roomId: this.roomId,
      sessionEndTime: sessionEnd,
    });
  };

  leaveRoom = () => {
    this.socket.disconnect();
  };

  sendCodeChange = (content: string) => {
    this.socket.emit(SocketEvent.CODE_CHANGE, {
      roomId: this.roomId,
      content: content,
    });
  };

  sendCodeEvent = (event: string) => {
    this.socket.emit(SocketEvent.SEND_CODE_EVENT, { roomId: this.roomId, event: event,});
  }



  receiveCodeEvent = (setEvents: React.Dispatch<React.SetStateAction<string[]>>) => {
    this.socket.on(SocketEvent.CODE_EVENT, (event: string) => {
      setEvents((events) => [...events, event]);
    })
  }

  receiveCodeUpdate = (
    setCurrentCode: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    this.socket.on(SocketEvent.CODE_UPDATE, (content: string) => {
      setCurrentCode(content);
    });
  };

  sendGetSessionTimer = () => {
    this.socket.emit(SocketEvent.GET_SESSION_TIMER, this.roomId);
  };

  receiveSessionTimer = (
    setSessionTimer: React.Dispatch<React.SetStateAction<Date>>
  ) => {
    this.socket.on(SocketEvent.SESSION_TIMER, (sessionEndTime: string) => {
      if (sessionEndTime == "") notFound();
      let utcDate = new Date(sessionEndTime);
      setSessionTimer(utcDate);
    });
  };

  sendChatMessage = (message: ChatMessage) => {
    this.socket.emit(SocketEvent.SEND_CHAT_MESSAGE, {
      roomId: this.roomId,
      message: message,
    });
  };

  updateChatMessages = (
    setNewMessages: React.Dispatch<React.SetStateAction<ChatMessage>>
  ) => {
    this.socket.on(SocketEvent.UPDATE_CHAT_MESSAGE, (message: ChatMessage) => {
      setNewMessages(message);
    });
  };

  receivePartnerConnection = (
    setPartnerConnection: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    this.socket.on(
      SocketEvent.PARTNER_CONNECTION,
      (partnerDict: { userId: string; status: boolean }) => {
        setPartnerConnection(partnerDict.status);
      }
    );
  };

  endSession = () => {
    this.socket.emit(SocketEvent.END_SESSION, this.roomId);
  };

  receiveChatList = (
    setMessages: React.Dispatch<SetStateAction<ChatMessage[]>>
  ) => {
    this.socket.on(SocketEvent.UPDATE_CHAT_LIST, (messages: string) => {
      setMessages(JSON.parse(`[${messages}]`).reverse());
    });
  };

  receiveEndSession = (
    setEndSessionState: React.Dispatch<
      SetStateAction<{
        partnerId: string;
        questionId: string;
        matchedLanguage: string;
        code: string;
        date: Date;
      }>
    >
  ) => {
    this.socket.on(SocketEvent.END_SESSION, (code: string) => {
      setEndSessionState({
        partnerId: this.partnerId,
        questionId: this.questionId,
        matchedLanguage: this.language,
        code: code,
        date: new Date(),
      });
    });
  };

  sendConfirmEndSession = () => {
    this.socket.emit(SocketEvent.CONFIRM_END_SESSION, {
      roomId: this.roomId,
      userId: this.userId,
    });
  };

  receiveRoomNotFound = (
    setRoomNotFound: React.Dispatch<SetStateAction<boolean>>
  ) => {
    this.socket.on(SocketEvent.ROOM_NOT_FOUND, () => {
      setRoomNotFound(true);
    });
  };

  receiveUserNotValid(
    setUserNotValid: React.Dispatch<SetStateAction<boolean>>
  ) {
    this.socket.on(SocketEvent.USER_NOT_VALID, () => {
      setUserNotValid(true);
    });
  }

  receiveHasPartnerLeft(
    setPartnerLeft: React.Dispatch<SetStateAction<boolean>>
  ) {
    this.socket.on(SocketEvent.PARTNER_LEFT, () => {
      setPartnerLeft(true);
    });
  }

  sendPartnerCursor(cursorPosition: { lineNumber: number, column: number }) {
    this.socket.emit(SocketEvent.SEND_CURSOR_CHANGE, { roomId: this.roomId, cursorPosition: JSON.stringify(cursorPosition) })
  }

  receivePartnerCursor(setPartnerCursor: React.Dispatch<SetStateAction<Position>>) {
    this.socket.on(SocketEvent.CURSOR_CHANGE, (cursorPosition: string) => {
      setPartnerCursor(JSON.parse(cursorPosition));
    })
  }

  sendPartnerHighlight(highlightPosition: Range) {
    this.socket.emit(SocketEvent.SEND_HIGHLIGHT_CHANGE, { roomId: this.roomId, highlightPosition: JSON.stringify(highlightPosition) })
  }

  receivePartnerHighlight(setPartnerHighlight: React.Dispatch<SetStateAction<Range>>) {
    this.socket.on(SocketEvent.HIGHLIGHT_CHANGE, (highlightPosition: string) => {
      setPartnerHighlight(JSON.parse(highlightPosition));
    })
  }

}

export default SocketService;
