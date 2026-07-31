"use client";

import { observer } from "mobx-react-lite";
import { GamePhase } from "@/server/types";
import { store } from "@/stores/store";
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

  const { phase, boardRows, boardCols } = room.game;

  return (
    <div className="flex flex-row items-center gap-2">
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
      {phase === GamePhase.Preparation || phase === GamePhase.Playing ? (
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          Поле {boardRows}×{boardCols}
        </p>
      ) : null}
    </div>
  );
});
