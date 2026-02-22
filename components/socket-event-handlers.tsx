"use client";
import { useEffect } from "react";
import { SocketEvents } from "@/server/types";
import { socket } from "@/lib/socket";

export function SocketEventsHandler() {
  console.log("socket handler rendered");
  useEffect(() => {
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
}
