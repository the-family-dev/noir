"use client";
import { store } from "@/store/store";
import { Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { GamePhase } from "@/server/types";
import { UsersList } from "./users-list";
import { Chat } from "./chat";
import { MyUser } from "./my-user";
import { LobbyPanel } from "./lobby-panel";
import { GameBoard } from "./game-board";
import { GameLog } from "./game-log";
import { GameOver } from "./game-over";
import { InterrogationPanel } from "./interrogation-panel";
import { SecretIdentity } from "./secret-identity";

export const Room = observer(() => {
  const { room, game } = store;

  if (room === undefined) return null;

  const isPlaying = game?.phase === GamePhase.Playing;
  const isFinished = game?.phase === GamePhase.Finished;

  return (
    <>
      <MyUser />
      <div className="flex h-full w-full flex-row gap-6">
        <Surface
          variant="transparent"
          className="flex h-full w-75 flex-col gap-4 overflow-y-auto rounded border p-4"
        >
          <div className="text-lg font-semibold">Комната {room.roomCode}</div>
          <div className="text-xs text-neutral-500">
            Передайте код друзьям, чтобы они присоединились к партии.
          </div>
          <UsersList users={room.users} />
          <div className="mt-auto text-xs text-neutral-500">
            Участников: {room.users.length}
          </div>
        </Surface>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {game === undefined && <LobbyPanel />}
          {isPlaying && <GameBoard />}
          {isPlaying && <InterrogationPanel />}
          {isFinished && <GameOver />}
          {game !== undefined && <GameLog />}
        </div>

        <div className="flex w-75 flex-col gap-4">
          {game !== undefined && <SecretIdentity />}
          <Chat />
        </div>
      </div>
    </>
  );
});

