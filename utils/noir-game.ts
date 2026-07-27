import {
  DEFAULT_BOARD_SIZE,
  MAX_BOARD_SIZE,
  MIN_BOARD_SIZE,
} from "@/data/characters";
import { GamePhase, NoirGameState } from "@/server/types";

/**
 * Размер поля по числу игроков (масштабирование в духе Noir).
 * 1–2 → 4×4, 3–4 → 5×5, 5–6 → 6×6, 7+ → 7×7
 */
export function boardSizeForPlayerCount(playerCount: number): number {
  const count = Math.max(0, playerCount);

  if (count <= 2) return MIN_BOARD_SIZE;
  if (count <= 4) return DEFAULT_BOARD_SIZE;
  if (count <= 6) return Math.min(6, MAX_BOARD_SIZE);
  return MAX_BOARD_SIZE;
}

export function createInitialNoirGameState(
  playerCount = 1,
): NoirGameState {
  return {
    phase: GamePhase.Preparation,
    boardSize: boardSizeForPlayerCount(playerCount),
  };
}

/** Обновляет размер поля, пока идёт подготовка */
export function syncPreparationBoardSize(
  game: NoirGameState,
  playerCount: number,
): NoirGameState {
  if (game.phase !== GamePhase.Preparation) return game;

  const boardSize = boardSizeForPlayerCount(playerCount);
  if (game.boardSize === boardSize) return game;

  return { ...game, boardSize };
}

export const GAME_PHASE_LABELS: Record<GamePhase, string> = {
  [GamePhase.Preparation]: "Подготовка",
  [GamePhase.Playing]: "Игра",
  [GamePhase.Finished]: "Итоги",
};
