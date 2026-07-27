"use client";
import { Chat } from "@/components/chat";
import { GameBoard } from "@/components/game-board";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { store } from "@/store/store";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-row gap-4 h-full w-full min-h-0 relative">
      <div className="flex-1 min-w-0 flex items-center justify-center">
        <GameBoard />
      </div>
      <Chat />
    </div>
  );
});
