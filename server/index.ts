import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketEvents,
  TRoom,
} from "./types";
import { generateCode } from "../utils/code-generaator";
import { rooms } from "./data";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Инициализация Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

  io.on(SocketEvents.Connection, (socket) => {
    console.log("user connected ", socket.id);

    socket.on(SocketEvents.JoinRoom, (params) => {
      console.log(SocketEvents.JoinRoom, params);
      const { userName, roomCode } = params;

      const room = rooms.get(roomCode);

      if (room === undefined) {
        io.to(socket.id).emit(SocketEvents.RoomNotFound, roomCode);
        return;
      }

      room.users.push({
        id: socket.id,
        name: userName,
      });

      socket.join(room.roomCode);

      io.to(room.roomCode).emit(SocketEvents.UserJoined, room);
    });

    socket.on(SocketEvents.CreateRoom, (userName) => {
      console.log(SocketEvents.CreateRoom, userName);

      const roomCode = generateCode(4);

      const room: TRoom = {
        roomCode,
        users: [
          {
            id: socket.id,
            name: userName,
            isAdmin: true,
          },
        ],
      };

      rooms.set(roomCode, room);

      socket.join(roomCode);

      io.to(socket.id).emit(SocketEvents.RoomCreated, room);
    });

    socket.on(SocketEvents.Disconnect, (reson) => {
      console.log(`user disconnected ${socket.id} by ${reson}`);
    });
  });

  // Запуск сервера
  httpServer.listen(port, () => {
    console.log(`Server running on http://${hostname}:${port}`);
  });
});
