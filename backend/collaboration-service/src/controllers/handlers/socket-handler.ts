import { Socket } from "socket.io";
import { SocketEvent } from "../../lib/enums/SocketEvent";
import { RedisHandler } from "./redis-handler";
import { io } from "../../app";
import logger from '../../lib/utils/logger';
import { get } from "http";

/** 
 * Redis structures
 * 
 * Room endSessionTime:
 * <roomid>: { sessionEndTime: string, users: user1,user2 }
 * 
 * Room content:
 * <roomid>_content: string
 *
 * Chat messages:
 * <roomid>_messages: [string, string, ...] (in reverse order)
 * 
*/

// This keeps track of the userId in each session
const activeSessions = new Map<string, string[]>();

export const SocketHandler = (socket: Socket) => {

  socket.on(SocketEvent.JOIN_ROOM, async (
    joinDict: { 
      userId: string,
      roomId: string, 
      sessionEndTime: string, 
    }
    ) => {
      await handleJoinRoom(socket, joinDict);
    }
  );

  socket.on(
    SocketEvent.CODE_CHANGE,
    (editorDict: { roomId: string; content: string }) => {
      handleCodeChange(socket, editorDict);
    }
  );

  socket.on(SocketEvent.SEND_HIGHLIGHT_CHANGE, (highlightDict: { roomId: string; highlightPosition: string }) => {
    socket.to(highlightDict.roomId).emit(SocketEvent.HIGHLIGHT_CHANGE, highlightDict.highlightPosition);
  })

  socket.on(
    SocketEvent.SEND_CODE_EVENT,
    (codeDict: { roomId: string; event: string; }) => {
      socket.to(codeDict.roomId).emit(SocketEvent.CODE_EVENT, codeDict.event);
    }
  )
  
  socket.on(
    SocketEvent.SEND_CURSOR_CHANGE,
    (cursorDict: { roomId: string; cursorPosition: string }) => {
      socket.to(cursorDict.roomId).emit(SocketEvent.CURSOR_CHANGE, cursorDict.cursorPosition);
  })

  socket.on(SocketEvent.END_SESSION, (roomID) => {
    handleEndSession(socket, roomID);
    logger.debug(`[SocketHandler]: ${socket.id} ended session`)
  });

  socket.on((SocketEvent.CONFIRM_END_SESSION), async ( leaveDict: { roomId: string, userId: string }) => {
    await handleTerminateSession(socket, leaveDict.roomId, leaveDict.userId);
    if (activeSessions.get(leaveDict.roomId)?.length == 1) clearSessionDetails(leaveDict.roomId);
  })
  
  socket.on((SocketEvent.GET_SESSION_TIMER), (roomID) => {
    handleGetSessionTimer(socket, roomID);
  })

  socket.on(
    SocketEvent.SEND_CHAT_MESSAGE,
    (messageDict: {
      roomId: string;
      message: { uuid: string; content: string; senderId: string };
    }) => {
      handleChatMessage(socket, messageDict);
    }
  );

};

/**
 * Handles joining of room and emits session timer back to client (if exists)
 * @param socket 
 * @param joinDict 
 */
export async function handleJoinRoom(socket: Socket, joinDict: { userId: string, roomId: string; sessionEndTime: string}) {

  logger.debug(`[SocketHandler]: ${joinDict.userId} connected`)

  if (!await RedisHandler.doesRoomIdExist(joinDict.roomId)) {
    socket.emit(SocketEvent.ROOM_NOT_FOUND);
    return;
  }

  let sessionDetails = await RedisHandler.getSessionDetails(joinDict.roomId);
  logger.info(`[handleJoinRoom]: Session end: ${sessionDetails.sessionEndTime}`)
  let validUsers = sessionDetails.users.split(',');
  logger.info(`[handleJoinRoom]: validUsers: ${validUsers.toString()}`);

  if (!validUsers.includes(joinDict.userId)) {
    socket.emit(SocketEvent.USER_NOT_VALID);
    return;
  }

  socket.join(joinDict.roomId);

  if (activeSessions.get(joinDict.roomId)) {
    activeSessions.get(joinDict.roomId)?.push(joinDict.userId);
  } else {
    activeSessions.set(joinDict.roomId, [joinDict.userId]);
  }

  // Broadcast to room that partner's connection is active
  io.in(joinDict.roomId).emit(SocketEvent.PARTNER_CONNECTION, {userId: joinDict.userId, status: true });

  // Check redis cache for Editor content
  let cachedEditorContent = await RedisHandler.getEditorContent(joinDict.roomId);

  if (cachedEditorContent) {
    socket.emit(SocketEvent.CODE_UPDATE, cachedEditorContent);
  }

  let cachedMessages = await RedisHandler.getMessages(joinDict.roomId);

  if (cachedMessages) {
    logger.debug(`[handleJoinRoom]: Cached messages: ${cachedMessages.toString()}`)
    socket.emit(SocketEvent.UPDATE_CHAT_LIST, cachedMessages.toString())
  }

  // Local (room) notification
  socket.on(SocketEvent.DISCONNECT, async () => {
    activeSessions.get(joinDict.roomId)?.splice(
      activeSessions.get(joinDict.roomId)?.indexOf(joinDict.userId)!, 1
    );
    io.in(joinDict.roomId).emit(SocketEvent.PARTNER_CONNECTION, {userId: joinDict.userId, status: false });
    socket.removeAllListeners();
  })
}

/**
 * Emits code change back to client and stores to cache
 * @param socket 
 * @param editorDict 
 */
export function handleCodeChange(socket: Socket, editorDict: { roomId: string; content: string; }) {
  // socket.to(editorDict.roomId).emit(SocketEvent.CODE_UPDATE, editorDict.content);
  // Set new code change within cache
  RedisHandler.setCodeChange(editorDict.roomId, editorDict.content);
}

/**
 * Emits chat messages back to client and stores to cache
 * @param socket socket instance
 * @param messageDict message dictionary
 */

export function handleChatMessage(socket: Socket, messageDict: { roomId: string; message: { uuid: string; content: string; senderId: string; }; }) {
  RedisHandler.appendMessage(messageDict.roomId, JSON.stringify(messageDict.message));
  socket.to(messageDict.roomId).emit(SocketEvent.UPDATE_CHAT_MESSAGE, {
    uuid: messageDict.message.uuid,
    content: messageDict.message.content,
    senderId: messageDict.message.senderId,
  });
  logger.debug(`[handleCodeChange]: Setting message change for room ${messageDict.roomId}]`)
}

/**
 * Handles the first click on the end of session button
 * @param socket socket instance
 * @param roomId roomId of the session
 */
export async function handleEndSession(socket: Socket, roomId: string) {
  let editorContent = await RedisHandler.getEditorContent(roomId);
  socket.emit(SocketEvent.END_SESSION, editorContent);
}

/**
 * Obtains the session timer from Redis and emits it back to the client (useful for page refresh)
 * @param socket socket instance
 * @param roomId roomId of the session
 */
export async function handleGetSessionTimer(socket: Socket, roomId: string) {
  let endSessionTime = await RedisHandler.getSessionEndTime(roomId);
  socket.emit(SocketEvent.SESSION_TIMER, endSessionTime);
}

/**
 * Ensures user does not join back once he terminates the session
 * @param socket socket instance
 * @param roomId room id of the session
 */
export async function handleTerminateSession(socket: Socket, roomId: string, userId: string) {
  let validUsers = await RedisHandler.getUserIds(roomId);
  if (!validUsers) return;
  let validUsersList = validUsers!.split(',');
  if (validUsers && validUsersList.includes(userId)) {
    validUsersList.splice(validUsersList.indexOf(userId), 1);
    RedisHandler.setUserIds(roomId, validUsersList.toString());
  }
  socket.to(roomId).emit(SocketEvent.PARTNER_LEFT);
}

export function clearSessionDetails(roomId: string) {
  RedisHandler.delCodeChange(roomId);
  RedisHandler.delMessages(roomId);
  RedisHandler.delSessionDetails(roomId);
}

export { activeSessions };
