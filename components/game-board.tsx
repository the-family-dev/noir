"use client";

import { BoardGrid } from "@/components/board-grid";
import { CatchReveal } from "@/components/catch-reveal";
import { CharacterCardHighlight } from "@/components/character-card";
import { EndTurnButton } from "@/components/end-turn-button";
import { RefreshBoardButton } from "@/components/refresh-board-button";
import { InterrogationReveal } from "@/components/interrogation-reveal";
import { ShiftReveal } from "@/components/shift-reveal";
import { BoardShift } from "@/server/types";
import { store } from "@/stores/store";
import { getLineCharacters } from "@/utils/board-shift";
import { canCatchTarget } from "@/utils/catch";
import { canInterrogateTarget } from "@/utils/interrogation";
import { isTurnActionUsed } from "@/utils/turn-action";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

export const GameBoard = observer(function GameBoard() {
  const { room, sessionId, isMyTurn } = store;

  const board = room?.game.board ?? [];
  const boardRows = room?.game.boardRows ?? 0;
  const boardCols = room?.game.boardCols ?? 0;
  const assignments = room?.game.assignments ?? {};
  const boardShiftUsedThisTurn = room?.game.boardShiftUsedThisTurn ?? false;
  const boardRefreshUsedThisTurn =
    room?.game.boardRefreshUsedThisTurn ?? false;
  const interrogateUsedThisTurn = room?.game.interrogateUsedThisTurn ?? false;
  const catchUsedThisTurn = room?.game.catchUsedThisTurn ?? false;
  const lastBoardShift = room?.game.lastBoardShift ?? null;
  const lastInterrogation = room?.game.lastInterrogation ?? null;
  const lastCatch = room?.game.lastCatch ?? null;
  const members = room?.members ?? [];

  const selfCharacterId =
    sessionId !== undefined ? assignments[sessionId] : undefined;

  const actionUsed = room !== undefined && isTurnActionUsed(room.game);
  const canShift = isMyTurn && !actionUsed;
  const canOpenCardMenu = isMyTurn && !actionUsed;

  const interrogatableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!canOpenCardMenu || selfCharacterId === undefined) return ids;

    for (const character of board) {
      if (
        canInterrogateTarget(
          board,
          boardRows,
          boardCols,
          selfCharacterId,
          character.id,
        )
      ) {
        ids.add(character.id);
      }
    }
    return ids;
  }, [canOpenCardMenu, board, boardRows, boardCols, selfCharacterId]);

  const catchableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!canOpenCardMenu || selfCharacterId === undefined) return ids;

    for (const character of board) {
      if (
        canCatchTarget(
          board,
          boardRows,
          boardCols,
          selfCharacterId,
          character.id,
        )
      ) {
        ids.add(character.id);
      }
    }
    return ids;
  }, [canOpenCardMenu, board, boardRows, boardCols, selfCharacterId]);

  const highlightById = useMemo(() => {
    const map = new Map<string, CharacterCardHighlight>();

    if (lastCatch) {
      map.set(lastCatch.targetCharacterId, "target");
      return map;
    }

    if (lastInterrogation) {
      for (const id of lastInterrogation.zoneCharacterIds) {
        map.set(id, "zone");
      }
      map.set(lastInterrogation.targetCharacterId, "target");
      return map;
    }

    if (lastBoardShift) {
      const line = getLineCharacters(
        board,
        boardRows,
        boardCols,
        lastBoardShift,
      );
      for (const character of line) {
        map.set(character.id, "shift");
      }
    }

    return map;
  }, [
    lastCatch,
    lastInterrogation,
    lastBoardShift,
    board,
    boardRows,
    boardCols,
  ]);

  const revealingPlayers = useMemo(() => {
    if (!lastInterrogation) return [];
    const ids = new Set(lastInterrogation.revealingSessionIds);
    // Допрашивающий всегда рядом с целью — в списке его не показываем
    ids.delete(lastInterrogation.actorSessionId);
    return members.filter((m) => ids.has(m.sessionId));
  }, [lastInterrogation, members]);

  const interrogationTargetName = useMemo(() => {
    if (!lastInterrogation) return "";
    return (
      board.find((c) => c.id === lastInterrogation.targetCharacterId)?.name ??
      "…"
    );
  }, [lastInterrogation, board]);

  const interrogationActorName = useMemo(() => {
    if (!lastInterrogation) return "";
    return (
      members.find((m) => m.sessionId === lastInterrogation.actorSessionId)
        ?.name ?? "…"
    );
  }, [lastInterrogation, members]);

  const catchActorName = useMemo(() => {
    if (!lastCatch) return "";
    return (
      members.find((m) => m.sessionId === lastCatch.actorSessionId)?.name ??
      "…"
    );
  }, [lastCatch, members]);

  const catchTargetName = useMemo(() => {
    if (!lastCatch) return "";
    return (
      board.find((c) => c.id === lastCatch.targetCharacterId)?.name ?? "…"
    );
  }, [lastCatch, board]);

  const catchAccusedName = useMemo(() => {
    if (!lastCatch) return "";
    return (
      members.find((m) => m.sessionId === lastCatch.accusedSessionId)?.name ??
      "…"
    );
  }, [lastCatch, members]);

  const shiftActorName = useMemo(() => {
    if (!lastBoardShift) return "";
    return (
      members.find((m) => m.sessionId === lastBoardShift.actorSessionId)
        ?.name ?? "…"
    );
  }, [lastBoardShift, members]);

  if (room === undefined || board.length === 0) return null;

  const handleShift = (shift: BoardShift) => {
    if (!canShift) return;
    store.shiftBoard(shift);
  };

  const handleInterrogate = (targetCharacterId: string) => {
    if (!canOpenCardMenu) return;
    store.interrogate(targetCharacterId);
  };

  const handleCatch = (
    targetCharacterId: string,
    accusedSessionId: string,
  ) => {
    if (!canOpenCardMenu) return;
    store.catchSuspect(targetCharacterId, accusedSessionId);
  };

  const hint = (() => {
    if (!isMyTurn) return null;
    if (boardShiftUsedThisTurn) return "Сдвиг сделан — завершите ход";
    if (boardRefreshUsedThisTurn) return "Обновление сделано — завершите ход";
    if (interrogateUsedThisTurn) return "Допрос сделан — завершите ход";
    if (catchUsedThisTurn) return "Поимка сделана — завершите ход";
    return "Клик по карточке — действие; край поля — сдвиг";
  })();

  const revealBanner = (() => {
    if (lastCatch) {
      return (
        <CatchReveal
          actorName={catchActorName}
          targetName={catchTargetName}
          accusedName={catchAccusedName}
          hit={lastCatch.hit}
        />
      );
    }
    if (lastInterrogation) {
      return (
        <InterrogationReveal
          actorName={interrogationActorName}
          targetName={interrogationTargetName}
          revealingPlayers={revealingPlayers}
        />
      );
    }
    if (lastBoardShift) {
      return (
        <ShiftReveal actorName={shiftActorName} shift={lastBoardShift} />
      );
    }
    return null;
  })();

  return (
    <div className="relative flex h-full min-h-0 w-full max-w-6xl flex-col items-center gap-4">
      <div
        className="relative flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        {revealBanner ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-1">
            {revealBanner}
          </div>
        ) : null}
        <BoardGrid
          board={board}
          boardRows={boardRows}
          boardCols={boardCols}
          selfCharacterId={selfCharacterId}
          selfSessionId={sessionId}
          members={members}
          canShift={canShift}
          canOpenCardMenu={canOpenCardMenu}
          interrogatableIds={interrogatableIds}
          catchableIds={catchableIds}
          highlightById={highlightById}
          onShift={handleShift}
          onInterrogate={handleInterrogate}
          onCatch={handleCatch}
        />
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2">
        <p
          className={cn(
            "text-xs text-muted-foreground",
            !hint && "invisible",
          )}
        >
          {hint ?? "\u00a0"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <RefreshBoardButton />
          <EndTurnButton />
        </div>
      </div>
    </div>
  );
});
