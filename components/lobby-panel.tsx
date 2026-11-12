"use client";
import { Button, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import {
  ALLOWED_PLAYER_COUNTS,
  getBoardSize,
  getStartBlockReason,
  getTargetTrophies,
} from "@/server/game";

export const LobbyPanel = observer(function LobbyPanel() {
  const { room, isAdmin } = store;

  if (room === undefined) return null;

  const playerCount = room.users.length;
  const blockReason = getStartBlockReason(playerCount);

  return (
    <Surface
      variant="transparent"
      className="flex w-full flex-col gap-4 rounded border p-6"
    >
      <div className="text-2xl font-bold">Шпионские игры</div>
      <div className="flex flex-col gap-1 text-sm text-neutral-400">
        <div>
          В партии участвуют от 3 до 9 шпионов (кроме 7 — для семи игроков в
          сценарии нет расклада).
        </div>
        <div>Доступные составы: {ALLOWED_PLAYER_COUNTS.join(", ")} игроков.</div>
        <div>
          Каждый получает тайную личность — одного из подозреваемых на поле.
          Поймайте чужую личность, чтобы забрать карту доказательства как трофей.
        </div>
      </div>

      {blockReason === undefined ? (
        <div className="flex flex-col gap-1 text-sm text-neutral-400">
          <div>
            Поле {getBoardSize(playerCount)}×{getBoardSize(playerCount)}, для
            победы нужно {getTargetTrophies(playerCount)} трофея.
          </div>
        </div>
      ) : (
        <div className="text-sm text-amber-500">{blockReason}</div>
      )}

      {isAdmin ? (
        <Button
          className="w-full"
          isDisabled={blockReason !== undefined}
          onPress={() => store.startGame()}
        >
          Начать игру
        </Button>
      ) : (
        <div className="text-sm text-neutral-400">
          Ждём, когда создатель комнаты начнёт игру…
        </div>
      )}
    </Surface>
  );
});
