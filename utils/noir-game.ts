import {
  DEFAULT_BOARD_SIZE,
  MAX_BOARD_SIZE,
  MIN_BOARD_SIZE,
  pickCharacters,
} from "@/data/characters";
import {
  GamePhase,
  NoirGameState,
  TRoom,
  TUser,
} from "@/server/types";
import { shuffle } from "@/utils/shuffle";

/** Минимум игроков для старта */
export const MIN_PLAYERS_TO_START = 2;

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
    board: [],
    assignments: {},
    currentTurnSessionId: null,
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

/**
 * Собирает поле и раздаёт каждому игроку уникального персонажа с доски.
 * Первый ход — случайный игрок.
 */
export function buildPlayingGameState(
  boardSize: number,
  members: TUser[],
): NoirGameState {
  const board = pickCharacters(boardSize * boardSize);
  const identityPool = shuffle(board);
  const assignments: Record<string, string> = {};

  for (let i = 0; i < members.length; i++) {
    const character = identityPool[i];
    if (character === undefined) break;
    assignments[members[i].sessionId] = character.id;
  }

  const turnOrder = shuffle(members.map((m) => m.sessionId));

  return {
    phase: GamePhase.Playing,
    boardSize,
    board,
    assignments,
    currentTurnSessionId: turnOrder[0] ?? null,
  };
}

/**
 * Передаёт ход следующему игроку по кругу (порядок members).
 * Если текущего игрока уже нет в комнате — начинает с первого.
 */
export function advanceTurnToNext(
  game: NoirGameState,
  members: TUser[],
): NoirGameState {
  if (members.length === 0) {
    return { ...game, currentTurnSessionId: null };
  }

  const order = members.map((m) => m.sessionId);
  const currentIndex = game.currentTurnSessionId
    ? order.indexOf(game.currentTurnSessionId)
    : -1;
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;

  return {
    ...game,
    currentTurnSessionId: order[nextIndex] ?? null,
  };
}

/** Если ушедший был на ходу — передаёт ход следующему */
export function ensureValidCurrentTurn(
  game: NoirGameState,
  members: TUser[],
  removedSessionId?: string,
): NoirGameState {
  if (game.phase !== GamePhase.Playing) return game;
  if (members.length === 0) {
    return { ...game, currentTurnSessionId: null };
  }

  const stillValid =
    game.currentTurnSessionId !== null &&
    members.some((m) => m.sessionId === game.currentTurnSessionId);

  if (stillValid) return game;

  // Ушёл текущий — следующий после него в старом порядке уже недоступен,
  // берём первого оставшегося (или после removed, если он был известен)
  if (
    removedSessionId &&
    game.currentTurnSessionId === removedSessionId
  ) {
    return {
      ...game,
      currentTurnSessionId: members[0]?.sessionId ?? null,
    };
  }

  return {
    ...game,
    currentTurnSessionId: members[0]?.sessionId ?? null,
  };
}

/** Оставляет в assignments только личность указанного игрока */
export function sanitizeRoomForSession(
  room: TRoom,
  sessionId: string,
): TRoom {
  const selfId = room.game.assignments[sessionId];

  return {
    ...room,
    members: room.members.map((m) => ({ ...m })),
    game: {
      ...room.game,
      board: room.game.board.map((c) => ({ ...c })),
      assignments: selfId ? { [sessionId]: selfId } : {},
    },
  };
}

export const GAME_PHASE_LABELS: Record<GamePhase, string> = {
  [GamePhase.Preparation]: "Подготовка",
  [GamePhase.Playing]: "Игра",
  [GamePhase.Finished]: "Итоги",
};
