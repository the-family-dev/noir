import type { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  RoomError,
  ServerToClientEvents,
  SocketEvents,
  TRoom,
} from "./types";
import { roomService } from "./room-service";
import { sanitizeRoomForSession } from "@/utils/noir-game";

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

function emitError(socket: AppSocket, error: RoomError) {
  socket.emit(SocketEvents.AnyError, error);
}

/** Рассылает комнату каждому участнику с его личной раздачей */
function broadcastRoom(io: AppServer, room: TRoom) {
  for (const member of room.members) {
    if (member.disconnected) continue;
    const target = io.sockets.sockets.get(member.socketId);
    if (!target) continue;
    target.emit(
      SocketEvents.RoomUpdated,
      sanitizeRoomForSession(room, member.sessionId),
    );
  }
}

function emitRoomToSocket(
  socket: AppSocket,
  room: TRoom,
  sessionId: string,
  event: SocketEvents.RoomCreated | SocketEvents.RoomUpdated,
) {
  socket.emit(event, sanitizeRoomForSession(room, sessionId));
}

function detachSocketFromRoom(
  io: AppServer,
  socketId: string,
  roomCode: string,
) {
  const target = io.sockets.sockets.get(socketId);
  if (target) {
    target.leave(roomCode);
  }
}

export function registerSocketHandlers(io: AppServer, socket: AppSocket): void {
  socket.on(SocketEvents.SendMessage, (params) => {
    io.to(params.roomCode).emit(SocketEvents.ReceiveMessage, params.message);
  });

  socket.on(SocketEvents.CreateRoom, (params) => {
    const result = roomService.create({
      name: params.userName,
      sessionId: params.sessionId,
      socketId: socket.id,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    socket.join(result.room.roomCode);
    emitRoomToSocket(
      socket,
      result.room,
      params.sessionId,
      SocketEvents.RoomCreated,
    );
  });

  socket.on(SocketEvents.JoinRoom, (params) => {
    const result = roomService.join({
      roomCode: params.roomCode,
      name: params.userName,
      sessionId: params.sessionId,
      socketId: socket.id,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    socket.join(result.room.roomCode);

    if (result.reconnected) {
      socket.emit(SocketEvents.UserReconnected, result.member);
    }

    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.ReconnectRoom, (params) => {
    const result = roomService.reconnect({
      roomCode: params.roomCode,
      sessionId: params.sessionId,
      socketId: socket.id,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    socket.join(result.room.roomCode);
    socket.emit(SocketEvents.UserReconnected, result.member);
    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.LeaveRoom, (roomCode) => {
    const result = roomService.leave(roomCode, socket.id);
    if (!result.ok) return;

    socket.leave(roomCode);

    if (result.room) {
      broadcastRoom(io, result.room);
    }
  });

  socket.on(SocketEvents.KickUser, (params) => {
    const result = roomService.kick({
      roomCode: params.roomCode,
      adminSocketId: socket.id,
      targetSessionId: params.targetSessionId,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    detachSocketFromRoom(io, result.removed.socketId, params.roomCode);
    io.to(result.removed.socketId).emit(SocketEvents.UserKicked);

    if (result.room) {
      broadcastRoom(io, result.room);
    }
  });

  socket.on(SocketEvents.StartGame, (params) => {
    const result = roomService.startGame({
      roomCode: params.roomCode,
      adminSocketId: socket.id,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.EndTurn, (params) => {
    const result = roomService.endTurn({
      roomCode: params.roomCode,
      socketId: socket.id,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.ShiftBoard, (params) => {
    const result = roomService.shiftBoard({
      roomCode: params.roomCode,
      socketId: socket.id,
      shift: params.shift,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.Interrogate, (params) => {
    const result = roomService.interrogate({
      roomCode: params.roomCode,
      socketId: socket.id,
      targetCharacterId: params.targetCharacterId,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.CatchSuspect, (params) => {
    const result = roomService.catchSuspect({
      roomCode: params.roomCode,
      socketId: socket.id,
      targetCharacterId: params.targetCharacterId,
      accusedSessionId: params.accusedSessionId,
    });

    if (!result.ok) {
      emitError(socket, result);
      return;
    }

    broadcastRoom(io, result.room);
  });

  socket.on(SocketEvents.Disconnect, () => {
    const found = roomService.disconnect(socket.id);
    if (found === undefined) return;

    broadcastRoom(io, found.room);
  });
}
