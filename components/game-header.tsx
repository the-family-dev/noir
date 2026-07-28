"use client";
import { observer } from "mobx-react-lite";
import { RoomActions } from "./room-actions";
import { GamePhaseIndicator } from "./game-phase-indicator";
import { CurrentTurnIndicator } from "./current-turn-controls";
import { store } from "@/store/store";
import { GamePhase } from "@/server/types";

export const GameHeader = observer(() => {
  const { room } = store;
  const isPlaying = room?.game.phase === GamePhase.Playing;

  return (
    <div className="flex flex-row items-center justify-between w-full h-fit gap-4">
      <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
        {room ? (
          <>
            <p className="font-mono text-2xl font-semibold text-foreground shrink-0">
              {room.roomCode}
            </p>
            <GamePhaseIndicator />
            {isPlaying ? <CurrentTurnIndicator /> : null}
          </>
        ) : null}
      </div>
      <div className="flex shrink-0 justify-end">
        <RoomActions />
      </div>
    </div>
  );
});
