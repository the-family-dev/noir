"use client";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { SocketEvents } from "@/server/types";
import { socket } from "@/lib/socket";
import { store } from "../store/store";

export const SocketEventsHandler = observer(function SocketEventsHandler() {
  console.log("socket handler rendered");
  useEffect(() => {
    socket.on(SocketEvents.RoomCreated, (room) => {
      console.log(SocketEvents.RoomCreated, room);

      store.setRoom(room);
    });

    socket.on(SocketEvents.ReciveMessage, (message) => {
      store.reciveMessage(message);
    });

    socket.on(SocketEvents.MyUserJoined, (user) => {
      console.log(SocketEvents.MyUserJoined, { user });
      store.setUser(user);
    });

    socket.on(SocketEvents.UserJoined, (room) => {
      console.log(SocketEvents.UserJoined, room);

      store.setRoom(room);
    });

    return () => {
      console.log("socket handler unmounted");
    };
  }, []);

  return null;
});
