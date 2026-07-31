"use client";
import { observer } from "mobx-react-lite";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { RoomErrorCode, SocketEvents } from "@/server/types";
import { socket } from "@/lib/socket";
import { store } from "@/stores/store";
import { toast } from "sonner";

export const SocketEventsHandler = observer(function SocketEventsHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    store.setRouter(router);
    store.setPathname(pathname);
  }, [router, pathname]);

  useLayoutEffect(() => {
    store.requestStoredName();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- однократная инициализация
  }, []);

  useEffect(() => {
    const onConnect = () => {
      store.tryAutoReconnect();
    };

    const applyRoom = (room: Parameters<typeof store.setRoom>[0]) => {
      if (store.suppressAutoJoin) return;

      if (store.sessionId && !store.isMemberOf(room)) {
        store.handleKicked();
        return;
      }

      const shouldNavigate = store.room?.roomCode !== room.roomCode;
      store.setRoom(room);
      if (shouldNavigate) {
        router.push(`/game/${room.roomCode}`);
      }
    };

    socket.on("connect", onConnect);

    socket.on(SocketEvents.RoomCreated, (room) => {
      store.setRoom(room);
      router.push(`/game/${room.roomCode}`);
    });

    socket.on(SocketEvents.RoomUpdated, applyRoom);

    socket.on(SocketEvents.AnyError, (error) => {
      toast.error(error.message);
      store.setEnteringRoom(false);

      if (error.code === RoomErrorCode.NameTaken) {
        store.router?.push("/register");
        return;
      }

      if (store.room) return;

      if (
        error.code === RoomErrorCode.SessionNotFound ||
        error.code === RoomErrorCode.RoomNotFound
      ) {
        store.clearActiveRoom();
      }
    });

    socket.on(SocketEvents.UserKicked, () => {
      store.handleKicked();
      toast.warning("Вас исключили из комнаты");
    });

    socket.on(SocketEvents.ReceiveMessage, (message) => {
      store.chat.receive(message);
    });

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off(SocketEvents.RoomCreated);
      socket.off(SocketEvents.RoomUpdated);
      socket.off(SocketEvents.AnyError);
      socket.off(SocketEvents.UserKicked);
      socket.off(SocketEvents.ReceiveMessage);
    };
  }, [router]);

  return null;
});
