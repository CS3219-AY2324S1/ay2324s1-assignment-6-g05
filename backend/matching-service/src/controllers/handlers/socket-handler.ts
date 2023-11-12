import { Socket } from 'socket.io';
import { io } from '../../app';
import RoomManager from '../../lib/utils/roomManager';
import Preference from '../../models/types/preference';
import Partner from '../../models/types/partner';
import Room from '../../models/types/room';
import { generateRoomId } from '../../lib/utils/encoder';
import SocketEvent from '../../lib/enums/SocketEvent';
import logger from '../../lib/utils/logger';
import eventBus from '../../models/event_bus/event_bus';
import dotenv from "dotenv";

dotenv.config();

const timeout = Number(process.env.MATCHING_TIMEOUT) || 60000;
const rm: RoomManager = RoomManager.getInstance();
const activeSockets = new Set();

const handleMatching = (socket: Socket, request: {
  user: Partner,
  preferences: Preference,
}) => {
  if (!activeSockets.has(socket.id)) {
    logger.debug(`[${socket.id}][handleMatching] Matching request received.`);
    setTimeout(() => {
      try {
        request.user.socketId = socket.id;
        rm.findMatchElseCreateRoom(
          request.user,
          request.preferences,
          room => handleMatched(socket, room, request.user),
          room => handleCreateRoom(socket, room),
        )
      } catch (error) {
        notifyError(socket, error);
      }

    }, 2000);
    activeSockets.add(socket.id);
  } else {
    logger.debug(`[${socket.id}][handleMatching] Socket is active, discard duplicate request.`);
  }
};

const handleMatched = (socket: Socket, room: Room, requester: Partner) => {
  // ensure owner does not join the room twice
  if (room.owner.id === requester.id) {
    return;
  }

  logger.debug(room, `[${socket.id}][handleMatched] Matched room(${room.id}), socket(${socket.id}) joined`);
  socket.join(room.id)

  // inform owner 
  socket.to(room.id).emit("matched", {
    room: room.id,
    partner: requester,
    owner: room.owner.id,
    preferences: room.preferences
  })

  // inform self
  socket.emit("matched", {
    room: room.id,
    partner: room.owner,
    owner: room.owner.id,
    preferences: room.preferences
  })
}

const handleCreateRoom = (socket: Socket, room: Room) => {
  logger.debug(`[${socket.id}][handleCreateRoom] Created Room(${room.id}), socket(${socket.id}) joined`);
  socket.join(room.id);

  // Register timeout handler
  setTimeout(() => {
    if (!room.matched) {
      logger.debug(`[${socket.id}][handleCreateRoom.callback] Timeout(${timeout}), no match found, close Room(${room.id})`);
      activeSockets.delete(socket.id);
      socket.emit("no_match");
      rm.closeRoom(room.id);
    }
  }, timeout)
}

const handleReady = (socket: Socket, ready: boolean) => {
  logger.debug(`[${socket.id}][handleReady]: notify ready state change`);

  try {
    socket.rooms.forEach((r) => {
      if (r !== socket.id) {
        socket.to(r).emit("partner_ready_change", ready);
      }
    });
  } catch (error) {
    notifyError(socket, error);
  }
};

const handleStart = (socket: Socket, data: {
  questionId: string, 
  language:   string
}) => {
  logger.debug(
    `[${socket.id}][notifyStart]: Preparing collab`
  );

  socket.rooms.forEach(r => {
    if (r !== socket.id) {
      const room = rm.getRoomById(r);
      if (room) {
        const roomId = generateRoomId(
          room.owner.id,
          room.partner.id,
          data.questionId,
          data.language
        );

        const roomConfig = {
          id: roomId,
          owner: room.owner.id,
          partner: room.partner.id,
          questionId: data.questionId,
          language: data.language,
        };

        // Emit to collaboration service to create the room
        eventBus.publish('matching-collaboration', JSON.stringify({ roomId: roomId, user1: roomConfig.owner, user2: roomConfig.partner }))

        io.sockets.in(r).emit("redirect_collaboration", roomConfig);
      }
    }
  });
};

const handleCancel = (socket: Socket) => {
  logger.debug(`[${socket.id}][handleCancel]: Close room and inform partner`);

  socket.rooms.forEach((r) => {
    if (r !== socket.id) {
      logger.debug(`[NotifyClosed]: room ${r}`);

      const room = rm.getRoomById(r);
      if (room) {
        room.owner
          ? activeSockets.delete((room.owner as Partner).socketId)
          : {};
        room.partner
          ? activeSockets.delete((room.partner as Partner).socketId)
          : {};
      }

      io.to(r).emit("room_closed");
      rm.closeRoom(r);
    }
  });
}

const notifyError = (socket: Socket, error: any) => {
  logger.error(`[${socket.id}][notifyError]: `, error);
  socket.disconnect();
};

export const SocketHandler = (socket: Socket) => {
  logger.info(`[${socket.id}][Connected]`);

  // Handles matching request, tries to find a room first before creating one
  socket.on(SocketEvent.REQUEST_MATCH, (request: any) => handleMatching(socket, request));

  // Notifies partner of users ready status
  socket.on(SocketEvent.USER_UPDATE_READY, (ready: boolean) => handleReady(socket, ready));

  // Notify matching server that clients should already start collab
  socket.on(SocketEvent.START_COLLABORATION, (data) => handleStart(socket, data));

  socket.on(SocketEvent.DISCONNECTING, (data: any) => handleCancel(socket));
  socket.on(SocketEvent.DISCONNECT, () => {
    logger.info(`[${socket.id}][Disconnect]`)
    activeSockets.delete(socket.id);
  });
}
