"use client";

import { observer } from "mobx-react-lite";
import { GamePhase } from "@/server/types";
import { store } from "@/store/store";
import { GAME_PHASE_LABELS } from "@/utils/noir-game";
import { cn } from "@/lib/utils";

const PHASE_ORDER: GamePhase[] = [
  GamePhase.Preparation,
  GamePhase.Playing,
  GamePhase.Finished,
];

export const GamePhaseIndicator = observer(function GamePhaseIndicator() {
  const { room } = store;
  if (room === undefined) return null;

  const { phase, boardSize } = room.game;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1"
        role="status"
        aria-label={`Фаза игры: ${GAME_PHASE_LABELS[phase]}`}
      >
        {PHASE_ORDER.map((step) => {
          const isActive = step === phase;
          return (
            <span
              key={step}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground",
              )}
            >
              {GAME_PHASE_LABELS[step]}
            </span>
          );
        })}
      </div>
      {phase === GamePhase.Preparation ? (
        <p className="text-xs text-muted-foreground">
          Поле {boardSize}×{boardSize}
        </p>
      ) : null}
    </div>
  );
});
