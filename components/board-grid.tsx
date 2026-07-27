"use client";

import { CharacterCard } from "@/components/character-card";
import { BoardLineCarousel } from "@/components/board-line-carousel";
import { BoardShiftArrow } from "@/components/board-shift-arrow";
import { BoardCharacter, BoardShift } from "@/server/types";
import { BOARD_GAP, getLineCharacters } from "@/utils/board-shift";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";

export type BoardGridProps = {
  board: BoardCharacter[];
  boardSize: number;
  selfCharacterId?: string;
  canShift: boolean;
  /** Активный сдвиг (карусель), иначе обычная сетка */
  animating: (BoardShift & { seq: number }) | null;
  onShift: (shift: BoardShift) => void;
  onAnimComplete: () => void;
};

export function BoardGrid({
  board,
  boardSize,
  selfCharacterId,
  canShift,
  animating,
  onShift,
  onAnimComplete,
}: BoardGridProps) {
  const gutter = "2.25rem";
  const animCol = animating?.axis === "column" ? animating.index : null;
  const animRow = animating?.axis === "row" ? animating.index : null;

  const renderCard = (character: BoardCharacter, key: string) => (
    <CharacterCard
      key={key}
      character={character}
      isSelf={character.id === selfCharacterId}
      className="h-full w-full"
    />
  );

  return (
    <div
      className="relative"
      style={{
        width: "min(100cqw, calc(100cqh * 3 / 4))",
        aspectRatio: "3 / 4",
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gap: BOARD_GAP,
          gridTemplateColumns: `${gutter} repeat(${boardSize}, minmax(0, 1fr)) ${gutter}`,
          gridTemplateRows: `${gutter} repeat(${boardSize}, minmax(0, 1fr)) ${gutter}`,
        }}
      >
        {Array.from({ length: boardSize }, (_, col) => (
          <BoardShiftArrow
            key={`up-${col}`}
            enabled={canShift}
            style={{ gridColumn: col + 2, gridRow: 1 }}
            label="Сдвинуть столбец вверх"
            onClick={() =>
              onShift({
                axis: "column",
                index: col,
                direction: "negative",
              })
            }
          >
            <ArrowUpIcon className="size-4" />
          </BoardShiftArrow>
        ))}

        {Array.from({ length: boardSize }, (_, row) => (
          <div key={`row-wrap-${row}`} className="contents">
            <BoardShiftArrow
              enabled={canShift}
              style={{ gridColumn: 1, gridRow: row + 2 }}
              label="Сдвинуть строку влево"
              onClick={() =>
                onShift({
                  axis: "row",
                  index: row,
                  direction: "negative",
                })
              }
            >
              <ArrowLeftIcon className="size-4" />
            </BoardShiftArrow>

            {animRow === row && animating ? (
              <BoardLineCarousel
                key={`row-anim-${animating.seq}-${row}`}
                orientation="horizontal"
                line={getLineCharacters(board, boardSize, animating)}
                direction={animating.direction}
                boardSize={boardSize}
                style={{
                  gridColumn: `2 / span ${boardSize}`,
                  gridRow: row + 2,
                }}
                renderCard={renderCard}
                onComplete={onAnimComplete}
              />
            ) : (
              Array.from({ length: boardSize }, (_, col) => {
                if (animCol === col) {
                  return (
                    <div
                      key={`ph-${row}-${col}`}
                      className="min-h-0 min-w-0"
                      style={{
                        gridColumn: col + 2,
                        gridRow: row + 2,
                      }}
                    />
                  );
                }
                const character = board[row * boardSize + col]!;
                return (
                  <div
                    key={character.id}
                    className="relative min-h-0 min-w-0"
                    style={{
                      gridColumn: col + 2,
                      gridRow: row + 2,
                    }}
                  >
                    {renderCard(character, character.id)}
                  </div>
                );
              })
            )}

            <BoardShiftArrow
              enabled={canShift}
              style={{ gridColumn: boardSize + 2, gridRow: row + 2 }}
              label="Сдвинуть строку вправо"
              onClick={() =>
                onShift({
                  axis: "row",
                  index: row,
                  direction: "positive",
                })
              }
            >
              <ArrowRightIcon className="size-4" />
            </BoardShiftArrow>
          </div>
        ))}

        {animCol !== null && animating ? (
          <BoardLineCarousel
            key={`col-anim-${animating.seq}-${animCol}`}
            orientation="vertical"
            line={getLineCharacters(board, boardSize, animating)}
            direction={animating.direction}
            boardSize={boardSize}
            style={{
              gridColumn: animCol + 2,
              gridRow: `2 / span ${boardSize}`,
            }}
            renderCard={renderCard}
            onComplete={onAnimComplete}
          />
        ) : null}

        {Array.from({ length: boardSize }, (_, col) => (
          <BoardShiftArrow
            key={`down-${col}`}
            enabled={canShift}
            style={{ gridColumn: col + 2, gridRow: boardSize + 2 }}
            label="Сдвинуть столбец вниз"
            onClick={() =>
              onShift({
                axis: "column",
                index: col,
                direction: "positive",
              })
            }
          >
            <ArrowDownIcon className="size-4" />
          </BoardShiftArrow>
        ))}
      </div>
    </div>
  );
}
