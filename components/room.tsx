"use client";
import { store } from "@/store/store";
import { Button, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { CheckIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { GamePhase } from "@/server/types";
import { getRoomInviteUrl } from "@/utils/room-link";
import { UsersList } from "./users-list";
import { LobbyPanel } from "./lobby-panel";
import { GameBoard } from "./game-board";
import { GameLog } from "./game-log";
import { GameOver } from "./game-over";
import { InterrogationPanel } from "./interrogation-panel";
import { RoomSidePanel } from "./room-side-panel";

export const Room = observer(() => {
  const { room, game } = store;
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  if (room === undefined) return null;

  const copyInviteLink = async () => {
    const inviteUrl = getRoomInviteUrl(room.roomCode, window.location.origin);

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsLinkCopied(true);
      store.notify("Ссылка на комнату скопирована", "success");
      window.setTimeout(() => setIsLinkCopied(false), 2000);
    } catch {
      store.notify(`Скопируйте ссылку вручную: ${inviteUrl}`, "warning");
    }
  };

  const isPlaying = game?.phase === GamePhase.Playing;
  const isFinished = game?.phase === GamePhase.Finished;

  return (
    <>
      <RoomSidePanel />
      <div className="flex h-full w-full flex-row gap-6 p-1">
        <Surface
          variant="transparent"
          className="flex h-full w-75 flex-col gap-4 overflow-y-auto rounded border p-4"
        >
          <div className="flex flex-col gap-2">
            <div className="text-lg font-semibold">
              Комната {room.roomCode}
            </div>
            <div className="text-xs text-neutral-500">
              Отправьте друзьям ссылку — они откроют комнату и подключатся, введя
              только имя.
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onPress={copyInviteLink}
            >
              {isLinkCopied ? (
                <CheckIcon className="size-4" />
              ) : (
                <LinkIcon className="size-4" />
              )}
              {isLinkCopied ? "Ссылка скопирована" : "Скопировать ссылку"}
            </Button>
          </div>
          <UsersList users={room.users} />
          <div className="mt-auto text-xs text-neutral-500">
            Участников: {room.users.length}
          </div>
        </Surface>

        {/* pr-8 keeps the field clear of the floating panel buttons */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-8">
          {game === undefined && <LobbyPanel />}
          {isPlaying && <GameBoard />}
          {isPlaying && <InterrogationPanel />}
          {isFinished && <GameOver />}
          {game !== undefined && <GameLog />}
        </div>
      </div>
    </>
  );
});

