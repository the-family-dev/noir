"use client";

import { BoardGrid } from "@/components/board-grid";
import {
  CurrentTurnIndicator,
  EndTurnButton,
} from "@/components/current-turn-controls";
import { BoardShift } from "@/server/types";
import { store } from "@/store/store";
import { observer } from "mobx-react-lite";

export const GameBoard = observer(function GameBoard() {
  const { room, sessionId, isMyTurn, boardShiftAnim } = store;
  if (room === undefined) return null;

  const { board, boardSize, assignments, boardShiftUsedThisTurn } = room.game;
  const selfCharacterId =
    sessionId !== undefined ? assignments[sessionId] : undefined;

  const isAnimating = boardShiftAnim !== null;
  const canShift = isMyTurn && !boardShiftUsedThisTurn && !isAnimating;

  /** Во время анимации показываем кадр «до», иначе актуальное состояние комнаты */
  const displayBoard = boardShiftAnim?.boardBefore ?? board;
  const displaySize = boardShiftAnim?.boardSize ?? boardSize;
  const animating = boardShiftAnim
    ? { ...boardShiftAnim.shift, seq: boardShiftAnim.seq }
    : null;

  if (displayBoard.length === 0) return null;

  const handleShift = (shift: BoardShift) => {
    if (!canShift) return;
    store.shiftBoard(shift);
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-3xl flex-col items-center gap-4">
      <CurrentTurnIndicator />

      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        <BoardGrid
          board={displayBoard}
          boardSize={displaySize}
          selfCharacterId={selfCharacterId}
          canShift={canShift}
          animating={animating}
          onShift={handleShift}
          onAnimComplete={() => store.clearBoardShiftAnim()}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        {isMyTurn && boardShiftUsedThisTurn ? (
          <p className="text-xs text-muted-foreground">
            Сдвиг сделан — завершите ход
          </p>
        ) : isMyTurn ? (
          <p className="text-xs text-muted-foreground">
            Наведите на край поля, чтобы сдвинуть ряд или столбец
          </p>
        ) : null}
        <EndTurnButton />
      </div>
    </div>
  );
});
