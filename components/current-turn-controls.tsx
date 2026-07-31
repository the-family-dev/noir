"use client";

import { observer } from "mobx-react-lite";
import { store } from "@/stores/store";
import { cn } from "@/lib/utils";

export const CurrentTurnIndicator = observer(function CurrentTurnIndicator() {
  const { currentTurnPlayer, isMyTurn } = store;
  if (currentTurnPlayer === undefined) return null;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-1 text-center text-xs",
        isMyTurn
          ? "border-amber-400/60 bg-amber-400/10 text-amber-100"
          : "border-border/60 bg-muted/30 text-muted-foreground",
      )}
      role="status"
    >
      {isMyTurn ? (
        <span className="font-medium text-foreground">Ваш ход</span>
      ) : (
        <span>
          Ход:{" "}
          <span className="font-medium text-foreground">
            {currentTurnPlayer.name}
          </span>
        </span>
      )}
    </div>
  );
});
