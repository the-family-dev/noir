"use client";

import { BoardGrid } from "@/components/board-grid";
import { CatchReveal } from "@/components/catch-reveal";
import { CharacterCardHighlight } from "@/components/character-card";
import { EndTurnButton } from "@/components/current-turn-controls";
import { InterrogationReveal } from "@/components/interrogation-reveal";
import { BoardShift } from "@/server/types";
import { store } from "@/store/store";
import { canCatchTarget } from "@/utils/catch";
import { canInterrogateTarget } from "@/utils/interrogation";
import { isTurnActionUsed } from "@/utils/turn-action";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

export const GameBoard = observer(function GameBoard() {
  const { room, sessionId, isMyTurn, boardShiftAnim } = store;

  const board = room?.game.board ?? [];
  const boardSize = room?.game.boardSize ?? 0;
  const assignments = room?.game.assignments ?? {};
  const boardShiftUsedThisTurn = room?.game.boardShiftUsedThisTurn ?? false;
  const interrogateUsedThisTurn = room?.game.interrogateUsedThisTurn ?? false;
  const catchUsedThisTurn = room?.game.catchUsedThisTurn ?? false;
  const lastInterrogation = room?.game.lastInterrogation ?? null;
  const lastCatch = room?.game.lastCatch ?? null;
  const members = room?.members ?? [];

  const selfCharacterId =
    sessionId !== undefined ? assignments[sessionId] : undefined;

  const isShiftAnimating = boardShiftAnim !== null;
  const actionUsed = room !== undefined && isTurnActionUsed(room.game);
  const canShift = isMyTurn && !actionUsed && !isShiftAnimating;
  const canOpenCardMenu = isMyTurn && !actionUsed && !isShiftAnimating;

  /** Во время анимации показываем кадр «до», иначе актуальное состояние комнаты */
  const displayBoard = boardShiftAnim?.boardBefore ?? board;
  const displaySize = boardShiftAnim?.boardSize ?? boardSize;
  const animating = boardShiftAnim
    ? { ...boardShiftAnim.shift, seq: boardShiftAnim.seq }
    : null;

  const interrogatableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!canOpenCardMenu || selfCharacterId === undefined) return ids;

    for (const character of displayBoard) {
      if (
        canInterrogateTarget(
          displayBoard,
          displaySize,
          selfCharacterId,
          character.id,
        )
      ) {
        ids.add(character.id);
      }
    }
    return ids;
  }, [canOpenCardMenu, displayBoard, displaySize, selfCharacterId]);

  const catchableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!canOpenCardMenu || selfCharacterId === undefined) return ids;

    for (const character of displayBoard) {
      if (
        canCatchTarget(
          displayBoard,
          displaySize,
          selfCharacterId,
          character.id,
        )
      ) {
        ids.add(character.id);
      }
    }
    return ids;
  }, [canOpenCardMenu, displayBoard, displaySize, selfCharacterId]);

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
    }

    return map;
  }, [lastCatch, lastInterrogation]);

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

  if (room === undefined || displayBoard.length === 0) return null;

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
    if (interrogateUsedThisTurn) return "Допрос сделан — завершите ход";
    if (catchUsedThisTurn) return "Поимка сделана — завершите ход";
    return "Клик по карточке — действие; край поля — сдвиг";
  })();

  return (
    <div className="relative flex h-full min-h-0 w-full max-w-3xl flex-col items-center gap-4">
      <div
        className="relative flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        {lastCatch ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-1">
            <CatchReveal
              actorName={catchActorName}
              targetName={catchTargetName}
              accusedName={catchAccusedName}
              hit={lastCatch.hit}
            />
          </div>
        ) : lastInterrogation ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-1">
            <InterrogationReveal
              actorName={interrogationActorName}
              targetName={interrogationTargetName}
              revealingPlayers={revealingPlayers}
            />
          </div>
        ) : null}
        <BoardGrid
          board={displayBoard}
          boardSize={displaySize}
          selfCharacterId={selfCharacterId}
          selfSessionId={sessionId}
          members={members}
          canShift={canShift}
          canOpenCardMenu={canOpenCardMenu}
          interrogatableIds={interrogatableIds}
          catchableIds={catchableIds}
          highlightById={highlightById}
          animating={animating}
          onShift={handleShift}
          onInterrogate={handleInterrogate}
          onCatch={handleCatch}
          onAnimComplete={() => store.clearBoardShiftAnim()}
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
        <EndTurnButton />
      </div>
    </div>
  );
});
