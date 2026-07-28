"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { cn } from "@/lib/utils";
import {
  canRefreshBoard,
  everyColumnHasDead,
  everyRowHasDead,
} from "@/utils/board-refresh";
import { isTurnActionUsed } from "@/utils/turn-action";
import { ChevronDownIcon, LayoutGridIcon } from "lucide-react";

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

export const EndTurnButton = observer(function EndTurnButton() {
  const { isMyTurn, room } = store;
  const canEndTurn =
    isMyTurn && room !== undefined && isTurnActionUsed(room.game);

  return (
    <Button
      size="lg"
      className={cn(
        "min-w-48",
        !isMyTurn && "invisible pointer-events-none",
      )}
      disabled={!canEndTurn}
      tabIndex={isMyTurn ? undefined : -1}
      aria-hidden={!isMyTurn}
      onClick={() => store.endTurn()}
    >
      Завершить ход
    </Button>
  );
});

/** Выбор обновления поля по строкам или по столбцам */
export const RefreshBoardButton = observer(function RefreshBoardButton() {
  const { isMyTurn, room, boardShiftAnim } = store;
  if (!isMyTurn || room === undefined) {
    return (
      <Button
        size="lg"
        variant="secondary"
        className="invisible pointer-events-none min-w-48"
        tabIndex={-1}
        aria-hidden
      >
        Обновить поле
      </Button>
    );
  }

  const { board, boardRows, boardCols } = room.game;
  const canAct =
    !isTurnActionUsed(room.game) && boardShiftAnim === null;
  const canByRows =
    canAct && canRefreshBoard(board, boardRows, boardCols, "row");
  const canByCols =
    canAct && canRefreshBoard(board, boardRows, boardCols, "column");
  const anyAvailable = canByRows || canByCols;

  const rowsHint = everyRowHasDead(board, boardRows, boardCols)
    ? "убрать погибшего из каждой строки"
    : "нужен погибший в каждой строке";
  const colsHint = everyColumnHasDead(board, boardRows, boardCols)
    ? "убрать погибшего из каждого столбца"
    : "нужен погибший в каждом столбце";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="lg"
            variant="secondary"
            className="min-w-48"
            disabled={!anyAvailable}
          />
        }
      >
        <LayoutGridIcon className="size-4" />
        Обновить поле
        <ChevronDownIcon className="size-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-56">
        <DropdownMenuItem
          disabled={!canByRows}
          onClick={() => store.refreshBoard("row")}
        >
          <div className="flex flex-col gap-0.5">
            <span>По строкам</span>
            <span className="text-xs text-muted-foreground">{rowsHint}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canByCols}
          onClick={() => store.refreshBoard("column")}
        >
          <div className="flex flex-col gap-0.5">
            <span>По столбцам</span>
            <span className="text-xs text-muted-foreground">{colsHint}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
