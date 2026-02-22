"use client";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { SocketEvents } from "@/server/types";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

export const SocketEventsHandler = observer(function SocketEventsHandler() {
  const router = useRouter();

  console.log("socket handler rendered");
  useEffect(() => {
    socket.on(SocketEvents.RoomCreated, (room) => {
      console.log(SocketEvents.RoomCreated, room);

      const { roomCode } = room;

      router.push(`/game/${roomCode}`);
    });

    socket.on(SocketEvents.ReciveMessage, (message) => {
      console.log(message);
    });

    socket.on(SocketEvents.UserJoined, (room) => {
      console.log(room);
    });

    return () => {
      console.log("socket handler unmounted");
    };
  }, []);

  return null;
});
