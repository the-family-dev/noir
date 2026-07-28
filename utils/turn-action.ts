import { NoirGameState } from "@/server/types";

/** В этом ходу уже сделано одно из действий */
export function isTurnActionUsed(game: NoirGameState): boolean {
  return (
    game.boardShiftUsedThisTurn ||
    game.boardRefreshUsedThisTurn ||
    game.interrogateUsedThisTurn ||
    game.catchUsedThisTurn
  );
}
