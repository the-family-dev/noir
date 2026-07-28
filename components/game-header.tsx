"use client";
import { observer } from "mobx-react-lite";
import { NameLabel } from "./name-label";
import { RoomActions } from "./room-actions";
import { GamePhaseIndicator } from "./game-phase-indicator";
import { CurrentTurnIndicator } from "./current-turn-controls";
import { store } from "@/store/store";
import { GamePhase } from "@/server/types";

export const GameHeader = observer(() => {
  const { room } = store;
  const isPlaying = room?.game.phase === GamePhase.Playing;

  return (
    <div className="flex flex-row items-end justify-between w-full h-fit gap-4">
      <NameLabel />
      <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
        {room ? (
          <>
            <p className="font-mono text-2xl font-semibold text-foreground">
              {room.roomCode}
            </p>
            <GamePhaseIndicator />
            {isPlaying ? <CurrentTurnIndicator /> : null}
          </>
        ) : null}
      </div>
      <RoomActions />
    </div>
  );
});
