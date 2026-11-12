"use client";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SocketEvents } from "@/server/types";
import { socket } from "@/lib/socket";
import { store } from "../store/store";
import { getRoomPath } from "@/utils/room-link";

export const SocketEventsHandler = observer(function SocketEventsHandler() {
  const router = useRouter();

  useEffect(() => {
    socket.on(SocketEvents.RoomCreated, (room) => {
      console.log(SocketEvents.RoomCreated, room);

      store.setRoom(room);

      // Адрес комнаты становится ссылкой-приглашением: её можно скопировать
      // и отправить друзьям, а не диктовать код
      router.replace(getRoomPath(room.roomCode));
    });

    socket.on(SocketEvents.RoomUpdated, (room) => {
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

    socket.on(SocketEvents.RoomNotFound, (roomCode) => {
      store.notify(`Комната «${roomCode}» не найдена`, "danger");
    });

    socket.on(SocketEvents.RoomError, (message) => {
      store.notify(message, "danger");
    });

    return () => {
      console.log("socket handler unmounted");
      socket.off(SocketEvents.RoomCreated);
      socket.off(SocketEvents.RoomUpdated);
      socket.off(SocketEvents.ReciveMessage);
      socket.off(SocketEvents.MyUserJoined);
      socket.off(SocketEvents.UserJoined);
      socket.off(SocketEvents.RoomNotFound);
      socket.off(SocketEvents.RoomError);
    };
  }, [router]);

  return null;
});

