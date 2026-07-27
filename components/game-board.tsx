"use client";

import { CharacterCard } from "@/components/character-card";
import {
  CurrentTurnIndicator,
  EndTurnButton,
} from "@/components/current-turn-controls";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";

export const GameBoard = observer(function GameBoard() {
  const { room, sessionId } = store;
  if (room === undefined) return null;

  const { boardSize, board, assignments } = room.game;
  const selfCharacterId =
    sessionId !== undefined ? assignments[sessionId] : undefined;

  if (board.length === 0) return null;

  return (
    <div className="flex h-full min-h-0 w-full max-w-3xl flex-col items-center gap-4">
      <CurrentTurnIndicator />

      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
            width: "min(100cqw, calc(100cqh * 3 / 4))",
            aspectRatio: "3 / 4",
          }}
        >
          {board.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelf={character.id === selfCharacterId}
            />
          ))}
        </div>
      </div>

      <EndTurnButton />
    </div>
  );
});
