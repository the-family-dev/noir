"use client";
import { Chat } from "@/components/chat";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { store } from "@/store/store";
import { Button } from "@/components/ui/button";
import { RoomUserCard } from "@/components/room-user-card";

export default observer(function Game() {
  const { userName, room, suppressAutoJoin } = store;
  const { code } = useParams<{ code?: string }>();

  useEffect(() => {
    if (suppressAutoJoin) return;
    if (userName === undefined || code === undefined) return;
    if (room !== undefined) return;
    store.enterRoom(code);
  }, [userName, code, room, suppressAutoJoin]);

  if (userName === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <p className="text-muted-foreground text-sm">
            Чтобы войти в комнату, нужно представиться
          </p>
          <Button
            className="min-w-40"
            onClick={() => store.router?.push("/register")}
          >
            Ввести имя
          </Button>
        </div>
      </div>
    );
  }

  if (room === undefined) {
    return (
      <div className="flex flex-col gap-4 w-50 max-w-sm items-center">
        {code ? (
          <p className="text-muted-foreground text-lg text-center">
            Подключение к комнате{" "}
            <span className="font-mono font-semibold text-foreground">
              {code}
            </span>
            …
          </p>
        ) : null}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => store.router?.push("/")}
        >
          На главную
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 h-full w-full justify-between relative">
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <h2 className="text-lg font-semibold">Участники</h2>
        <div className="flex flex-col gap-2 max-w-md">
          {room.members.map((user) => (
            <RoomUserCard key={user.sessionId} user={user} />
          ))}
        </div>
      </div>
      <Chat />
    </div>
  );
});
