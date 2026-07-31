"use client";

import { Button } from "@/components/ui/button";
import { observer } from "mobx-react-lite";
import { store } from "@/stores/store";
import { MIN_PLAYERS_TO_START } from "@/utils/noir-game";
import { PlayIcon } from "lucide-react";

export const StartGamePanel = observer(function StartGamePanel() {
  const { room, isAdmin } = store;
  if (room === undefined) return null;

  const playerCount = room.members.length;
  const canStart = playerCount >= MIN_PLAYERS_TO_START;
  const { boardRows, boardCols } = room.game;

  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
      <div className="space-y-1">
        <p className="text-lg font-medium text-foreground">Подготовка</p>
        <p className="text-sm text-muted-foreground">
          Игроков: {playerCount} · Поле {boardRows}×{boardCols}
        </p>
      </div>

      {isAdmin ? (
        <Button
          size="lg"
          className="min-w-48"
          disabled={!canStart}
          onClick={() => store.startGame()}
        >
          <PlayIcon className="size-4" />
          Начать игру
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ожидаем, пока администратор начнёт игру…
        </p>
      )}

      {isAdmin && !canStart ? (
        <p className="text-xs text-muted-foreground">
          Нужно минимум {MIN_PLAYERS_TO_START} игрока
        </p>
      ) : null}
    </div>
  );
});
