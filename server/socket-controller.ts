import type { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketEvents,
  TUser,
} from "./types";
import { roomService } from "./room-service";
import { logEvent } from "./log-service";
import { isAdminSocket } from "@/utils/room-helpers";

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
): void {
  socket.on(SocketEvents.SendMessage, (params) => {
    io.to(params.roomCode).emit(SocketEvents.ReciveMessage, params.message);
  });

  socket.on(SocketEvents.LeaveRoom, (roomCode) => {
    logEvent(SocketEvents.LeaveRoom, roomCode);

    const room = roomService.getRoom(roomCode);
    if (room === undefined) return;

    roomService.removeMember(room, (m) => m.socketId === socket.id);
    socket.leave(room.roomCode);
    roomService.deleteRoomIfEmpty(room.roomCode);

    if (roomService.getRoom(room.roomCode)) {
      io.to(room.roomCode).emit(SocketEvents.RoomUpdated, room);
    }
  });

  socket.on(SocketEvents.KickUser, (params) => {
    const { roomCode, targetUserName } = params;
    const room = roomService.getRoom(roomCode);

    if (room === undefined) return;

    if (!isAdminSocket(room, socket.id)) {
      io.to(socket.id).emit(
        SocketEvents.AnyError,
        "Только администратор может исключить участника",
      );
      return;
    }

    const removed = roomService.removeMember(
      room,
      (m) => m.name === targetUserName,
    );

    if (removed === undefined) return;

    const kickedSocket = io.sockets.sockets.get(removed.socketId);
    if (kickedSocket) {
      kickedSocket.leave(room.roomCode);
    }

    io.to(removed.socketId).emit(SocketEvents.UserKicked);

    if (roomService.getRoom(room.roomCode)) {
      io.to(room.roomCode).emit(SocketEvents.RoomUpdated, room);
    }

    roomService.deleteRoomIfEmpty(room.roomCode);
  });

  socket.on(SocketEvents.ReconnectRoom, (params) => {
    const { roomCode, sessionId } = params;
    const room = roomService.getRoom(roomCode);

    if (room === undefined) {
      io.to(socket.id).emit(
        SocketEvents.AnyError,
        `Комната ${roomCode} не найдена`,
      );
      return;
    }

    const member = roomService.reconnectMember(room, sessionId, socket.id);

    if (member === undefined) {
      io.to(socket.id).emit(
        SocketEvents.AnyError,
        "Сессия не найдена в этой комнате",
      );
      return;
    }

    socket.join(room.roomCode);
    io.to(socket.id).emit(SocketEvents.UserReconnected, member);
    io.to(room.roomCode).emit(SocketEvents.RoomUpdated, room);
  });

  socket.on(SocketEvents.JoinRoom, (params) => {
    const { userName, roomCode, sessionId } = params;
    const room = roomService.getRoom(roomCode);

    if (room === undefined) {
      io.to(socket.id).emit(
        SocketEvents.AnyError,
        `Комната ${roomCode} не найдена`,
      );
      return;
    }

    const bySession = roomService.findMemberBySessionId(room, sessionId);

    if (bySession) {
      roomService.reconnectMember(room, sessionId, socket.id);
      socket.join(room.roomCode);
      io.to(socket.id).emit(SocketEvents.UserReconnected, bySession);
      io.to(room.roomCode).emit(SocketEvents.RoomUpdated, room);
      return;
    }

    const byName = roomService.findMemberByName(room, userName);

    if (byName && !byName.disconnected) {
      io.to(socket.id).emit(
        SocketEvents.AnyError,
        `Пользователь с именем ${byName.name} уже существует`,
      );
      return;
    }

    if (byName && byName.disconnected) {
      io.to(socket.id).emit(
        SocketEvents.AnyError,
        `Пользователь с именем ${byName.name} уже существует`,
      );
      return;
    }

    const newUser: TUser = {
      socketId: socket.id,
      sessionId,
      name: userName,
    };

    room.members.push(newUser);
    socket.join(room.roomCode);

    io.to(socket.id).emit(SocketEvents.MyUserJoined, newUser);
    io.to(room.roomCode).emit(SocketEvents.UserJoined, room);
  });

  socket.on(SocketEvents.CreateRoom, (params) => {
    const { userName, sessionId } = params;

    const newUser: TUser = {
      socketId: socket.id,
      sessionId,
      name: userName,
      isAdmin: true,
    };

    const room = roomService.createRoom(newUser);

    socket.join(room.roomCode);

    io.to(socket.id).emit(SocketEvents.MyUserJoined, newUser);
    io.to(socket.id).emit(SocketEvents.RoomCreated, room);
  });

  socket.on(SocketEvents.Disconnect, () => {
    const room = roomService.markDisconnected(socket.id);
    if (room === undefined) return;

    io.to(room.roomCode).emit(SocketEvents.RoomUpdated, room);
  });
}
