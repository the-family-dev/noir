"use client";
import { Fragment, useState } from "react";
import { Button } from "@heroui/react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { store } from "@/store/store";
import { GamePhase } from "@/server/types";
import { getSuspect } from "@/server/suspects";
import { getAdjacentIndexes } from "@/utils/board";
import { ActionPanel } from "./action-panel";

const cellWidth = 100;
const cellHeight = 108;
const arrowWidth = 36;

export const GameBoard = observer(function GameBoard() {
  const { game, isMyTurn } = store;
  const [selected, setSelected] = useState<number | undefined>(undefined);

  if (game === undefined) return null;

  const { size, myIndex } = game;
  const indexes = Array.from({ length: size }, (_, index) => index);
  const adjacent = myIndex >= 0 ? getAdjacentIndexes(size, myIndex) : [];
  const isPlaying = game.phase === GamePhase.Playing;
  const shiftDisabled = !isMyTurn || !isPlaying;

  const canPick = (index: number) =>
    isMyTurn && isPlaying && (index === myIndex || adjacent.includes(index));

  const renderArrow = (label: string, symbol: string, onPress: () => void) => (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        aria-label={label}
        isIconOnly
        size="sm"
        variant="secondary"
        isDisabled={shiftDisabled}
        onPress={onPress}
      >
        {symbol}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto grid w-fit gap-1"
          style={{
            gridTemplateColumns: `${arrowWidth}px repeat(${size}, ${cellWidth}px) ${arrowWidth}px`,
          }}
        >
          <div />
          {indexes.map((column) =>
            renderArrow(`Сдвинуть столбец ${column + 1} вверх`, "↑", () =>
              store.shiftColumn(column, -1),
            ),
          )}
          <div />

          {indexes.map((row) => (
            <Fragment key={`row-${row}`}>
              {renderArrow(`Сдвинуть ряд ${row + 1} влево`, "←", () =>
                store.shiftRow(row, -1),
              )}
              {indexes.map((column) => {
                const index = row * size + column;
                const cell = game.board[index];
                const suspect = getSuspect(cell.suspectId);
                const isMe = index === myIndex;
                const isAvailable =
                  isPlaying &&
                  isMyTurn &&
                  !cell.dead &&
                  (isMe || adjacent.includes(index));
                const isTarget =
                  game.lastInterrogation !== undefined &&
                  game.lastInterrogation.cellIndex === index;

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!canPick(index)}
                    onClick={() =>
                      setSelected(selected === index ? undefined : index)
                    }
                    className={classNames(
                      "relative flex flex-col items-center justify-center gap-1 rounded-lg border p-1 text-center transition",
                      cell.dead
                        ? "border-neutral-800 bg-neutral-950/60 text-neutral-600"
                        : "border-neutral-700 bg-neutral-900/80",
                      isMe && !cell.dead && "border-amber-500/70 bg-amber-500/10",
                      isAvailable &&
                        !isMe &&
                        "border-dashed border-amber-500/40 bg-amber-500/5",
                      isTarget && !isMe && "border-sky-500/60 bg-sky-500/10",
                      selected === index && "ring-2 ring-amber-400",
                      canPick(index)
                        ? "cursor-pointer hover:border-amber-400"
                        : "cursor-default",
                    )}
                    style={{ height: cellHeight }}
                  >
                    <span className="text-sm leading-tight font-semibold">
                      {suspect.name}
                    </span>
                    <span className="text-xs leading-tight text-neutral-500">
                      {suspect.role}
                    </span>
                    {cell.dead && (
                      <span className="absolute rotate-[-12deg] text-sm font-bold text-danger">
                        Погиб
                      </span>
                    )}
                    {isMe && !cell.dead && (
                      <span className="absolute right-1 top-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">
                        Вы
                      </span>
                    )}
                  </button>
                );
              })}
              {renderArrow(`Сдвинуть ряд ${row + 1} вправо`, "→", () =>
                store.shiftRow(row, 1),
              )}
            </Fragment>
          ))}

          <div />
          {indexes.map((column) =>
            renderArrow(`Сдвинуть столбец ${column + 1} вниз`, "↓", () =>
              store.shiftColumn(column, 1),
            ),
          )}
          <div />
        </div>
      </div>

      <ActionPanel
        selectedIndex={selected}
        onActionDone={() => setSelected(undefined)}
      />
    </div>
  );
});
