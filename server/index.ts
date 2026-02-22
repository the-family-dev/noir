import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketEvents,
} from "./types";

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
      console.log("join", params);
      const { userName, roomCode } = params;

      socket.join(roomCode);

      io.to(roomCode).emit(SocketEvents.UserJoined, {
        roomCode,
        users: [
          {
            id: socket.id,
            name: userName,
          },
        ],
      });
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
