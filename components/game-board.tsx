"use client";

import { useState } from "react";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_BOARD_SIZE,
  MAX_BOARD_SIZE,
  MIN_BOARD_SIZE,
  pickCharacters,
  TCharacter,
} from "@/data/characters";
import { cn } from "@/lib/utils";

const BOARD_SIZES = Array.from(
  { length: MAX_BOARD_SIZE - MIN_BOARD_SIZE + 1 },
  (_, i) => MIN_BOARD_SIZE + i,
);

function dealForSize(size: number): TCharacter[] {
  return pickCharacters(size * size);
}

export function GameBoard() {
  const [size, setSize] = useState(DEFAULT_BOARD_SIZE);
  const [characters, setCharacters] = useState(() =>
    dealForSize(DEFAULT_BOARD_SIZE),
  );

  const handleSizeChange = (nextSize: number) => {
    setSize(nextSize);
    setCharacters(dealForSize(nextSize));
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Размер поля</span>
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          {BOARD_SIZES.map((boardSize) => (
            <Button
              key={boardSize}
              size="sm"
              variant={size === boardSize ? "default" : "ghost"}
              className={cn(
                "min-w-10",
                size === boardSize && "pointer-events-none",
              )}
              onClick={() => handleSizeChange(boardSize)}
            >
              {boardSize}×{boardSize}
            </Button>
          ))}
        </div>
      </div>

      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            width: "min(100cqw, calc(100cqh * 3 / 4))",
            aspectRatio: "3 / 4",
          }}
        >
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </div>
    </div>
  );
}
