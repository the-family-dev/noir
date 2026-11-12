import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  GamePhase,
  ServerToClientEvents,
  SocketEvents,
  TGameAction,
  TGamePlayer,
  TRoom,
  TUser,
} from "./types";
import { generateCode } from "../utils/code-generaator";
import { rooms } from "./data";
import {
  createGame,
  getRoomView,
  performAction,
  removePlayer,
  resetGame,
} from "./game";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Инициализация Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

  const broadcastRoom = (room: TRoom) => {
    room.users.forEach((user) => {
      io.to(user.id).emit(SocketEvents.RoomUpdated, getRoomView(room, user.id));
    });
  };

  const findRoomByUser = (userId: string): TRoom | undefined => {
    for (const room of rooms.values()) {
      if (room.users.some((user) => user.id === userId)) return room;
    }
    return undefined;
  };

  const getUniqueName = (room: TRoom, name: string): string => {
    const baseName = name.trim() === "" ? "Шпион" : name.trim();
    let result = baseName;
    let suffix = 2;
    while (room.users.some((user) => user.name === result)) {
      result = `${baseName} ${suffix}`;
      suffix += 1;
    }
    return result;
  };

  const joinRoom = (
    socketId: string,
    room: TRoom,
    userName: string,
    isAdmin = false,
  ): TGamePlayer => {
    const newUser: TGamePlayer = {
      id: socketId,
      name: getUniqueName(room, userName),
      isAdmin: isAdmin || undefined,
      connected: true,
      trophies: [],
    };

    room.users.push(newUser);
    return newUser;
  };

  const emitRoomError = (socketId: string, message: string) => {
    io.to(socketId).emit(SocketEvents.RoomError, message);
  };

  const handleGameAction = (socketId: string, roomCode: string, action: TGameAction) => {
    const room = rooms.get(roomCode);

    if (room === undefined) {
      emitRoomError(socketId, "Комната не найдена");
      return;
    }

    const result = performAction(room, socketId, action);

    if (!result.ok) {
      emitRoomError(socketId, result.error);
      return;
    }

    broadcastRoom(room);
  };

  io.on(SocketEvents.Connection, (socket) => {
    console.log("user connected ", socket.id);

    socket.on(SocketEvents.SendMessage, (params) => {
      const room = rooms.get(params.roomCode);
      const me = room?.users.find((user) => user.id === socket.id);

      if (room === undefined || me === undefined) return;

      // Автора сообщения определяет сервер, а не клиент
      const content = params.message.content.trim().slice(0, 50);

      if (content === "") return;

      io.to(room.roomCode).emit(SocketEvents.ReciveMessage, {
        content,
        sender: { id: me.id, name: me.name, isAdmin: me.isAdmin },
      });
    });

    socket.on(SocketEvents.JoinRoom, (params) => {
      const { userName, roomCode } = params;
      const room = rooms.get(roomCode);

      if (room === undefined) {
        io.to(socket.id).emit(SocketEvents.RoomNotFound, roomCode);
        return;
      }

      if (room.game?.phase === GamePhase.Playing) {
        emitRoomError(socket.id, "Игра уже идёт — дождитесь её окончания");
        return;
      }

      if (room.users.some((user) => user.id === socket.id)) return;

      const newUser = joinRoom(socket.id, room, userName);
      socket.join(room.roomCode);

      const self: TUser = {
        id: newUser.id,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
      };

      io.to(socket.id).emit(SocketEvents.MyUserJoined, self);
      io.to(socket.id).emit(SocketEvents.RoomCreated, getRoomView(room, socket.id));
      io.to(room.roomCode).emit(SocketEvents.UserJoined, getRoomView(room, socket.id));
      broadcastRoom(room);

      console.log(SocketEvents.JoinRoom, { roomCode, user: newUser.name });
    });

    socket.on(SocketEvents.CreateRoom, (userName) => {
      console.log(SocketEvents.CreateRoom, userName);

      let roomCode = generateCode();
      while (rooms.has(roomCode)) {
        roomCode = generateCode();
      }

      const room: TRoom = {
        roomCode,
        users: [],
      };

      rooms.set(roomCode, room);
      const newUser = joinRoom(socket.id, room, userName, true);
      socket.join(roomCode);

      const self: TUser = { id: newUser.id, name: newUser.name, isAdmin: true };

      io.to(socket.id).emit(SocketEvents.MyUserJoined, self);
      io.to(socket.id).emit(SocketEvents.RoomCreated, getRoomView(room, socket.id));
      broadcastRoom(room);
    });

    socket.on(SocketEvents.StartGame, (params) => {
      const room = rooms.get(params.roomCode);

      if (room === undefined) {
        emitRoomError(socket.id, "Комната не найдена");
        return;
      }

      const me = room.users.find((user) => user.id === socket.id);

      if (me === undefined || !me.isAdmin) {
        emitRoomError(socket.id, "Начать игру может только создатель комнаты");
        return;
      }

      if (room.game !== undefined) {
        emitRoomError(socket.id, "Игра уже создана");
        return;
      }

      const result = createGame(room);

      if (!result.ok) {
        emitRoomError(socket.id, result.error);
        return;
      }

      broadcastRoom(room);
    });

    socket.on(SocketEvents.PlayAgain, (params) => {
      const room = rooms.get(params.roomCode);

      if (room === undefined) {
        emitRoomError(socket.id, "Комната не найдена");
        return;
      }

      const me = room.users.find((user) => user.id === socket.id);

      if (me === undefined || !me.isAdmin) {
        emitRoomError(socket.id, "Сбросить игру может только создатель комнаты");
        return;
      }

      if (room.game?.phase === GamePhase.Playing) {
        emitRoomError(socket.id, "Нельзя сбросить игру, пока она идёт");
        return;
      }

      resetGame(room);
      broadcastRoom(room);
    });

    socket.on(SocketEvents.ShiftRow, ({ roomCode, row, direction }) => {
      handleGameAction(socket.id, roomCode, {
        type: "shift-row",
        row,
        direction: direction === -1 ? -1 : 1,
      });
    });

    socket.on(SocketEvents.ShiftColumn, ({ roomCode, column, direction }) => {
      handleGameAction(socket.id, roomCode, {
        type: "shift-column",
        column,
        direction: direction === -1 ? -1 : 1,
      });
    });

    socket.on(SocketEvents.RefreshField, ({ roomCode }) => {
      handleGameAction(socket.id, roomCode, { type: "refresh" });
    });

    socket.on(SocketEvents.CatchSpy, ({ roomCode, cellIndex }) => {
      handleGameAction(socket.id, roomCode, { type: "catch", cellIndex });
    });

    socket.on(SocketEvents.InterrogateSuspect, ({ roomCode, cellIndex }) => {
      handleGameAction(socket.id, roomCode, { type: "interrogate", cellIndex });
    });

    socket.on(SocketEvents.Disconnect, (reason) => {
      console.log(`user disconnected ${socket.id} by ${reason}`);

      const room = findRoomByUser(socket.id);

      if (room === undefined) return;

      removePlayer(room, socket.id);

      if (room.users.length === 0) {
        rooms.delete(room.roomCode);
        return;
      }

      broadcastRoom(room);
    });
  });

  // Запуск сервера
  httpServer.listen(port, () => {
    console.log(`Server running on http://${hostname}:${port}`);
  });
});
