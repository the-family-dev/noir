"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { observer } from "mobx-react-lite";
import { store } from "@/stores/store";
import {
  canRefreshBoard,
  everyColumnHasDead,
  everyRowHasDead,
} from "@/utils/board-refresh";
import { isTurnActionUsed } from "@/utils/turn-action";
import { ChevronDownIcon, LayoutGridIcon } from "lucide-react";

/** Выбор обновления поля по строкам или по столбцам */
export const RefreshBoardButton = observer(function RefreshBoardButton() {
  const { isMyTurn, room } = store;
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
  const canAct = !isTurnActionUsed(room.game);
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
