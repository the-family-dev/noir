import { BoardCharacter, BoardInterrogation } from "@/server/types";
import {
  areAdjacentOrSame,
  findCharacterIndex,
  getNeighborIndices,
  sessionIdsAtBoardIndices,
} from "@/utils/board-adjacency";

export type ResolveInterrogationParams = {
  board: BoardCharacter[];
  boardSize: number;
  assignments: Record<string, string>;
  /** sessionId шпиона, проводящего допрос */
  actorSessionId: string;
  targetCharacterId: string;
  seq: number;
};

export type ResolveInterrogationResult =
  | { ok: true; interrogation: BoardInterrogation }
  | { ok: false; reason: "actor_missing" | "target_missing" | "not_adjacent" };

/**
 * Считает результат допроса (Canvas):
 * руку поднимают все игроки рядом с целью и владелец личности цели.
 */
export function resolveInterrogation(
  params: ResolveInterrogationParams,
): ResolveInterrogationResult {
  const {
    board,
    boardSize,
    assignments,
    actorSessionId,
    targetCharacterId,
    seq,
  } = params;

  const actorCharacterId = assignments[actorSessionId];
  if (actorCharacterId === undefined) {
    return { ok: false, reason: "actor_missing" };
  }

  const actorIndex = findCharacterIndex(board, actorCharacterId);
  const targetIndex = findCharacterIndex(board, targetCharacterId);
  if (actorIndex === -1 || targetIndex === -1) {
    return { ok: false, reason: "target_missing" };
  }

  if (!areAdjacentOrSame(actorIndex, targetIndex, boardSize)) {
    return { ok: false, reason: "not_adjacent" };
  }

  const neighborIndices = getNeighborIndices(targetIndex, boardSize);
  const zoneCharacterIds = [
    targetCharacterId,
    ...neighborIndices.map((i) => board[i]!.id),
  ];

  /** Соседи цели + сама цель (владелец личности цели тоже поднимает руку) */
  const revealingIndices = [...neighborIndices, targetIndex];
  const revealingSessionIds = sessionIdsAtBoardIndices(
    board,
    assignments,
    revealingIndices,
  );

  return {
    ok: true,
    interrogation: {
      seq,
      actorSessionId,
      targetCharacterId,
      zoneCharacterIds,
      revealingSessionIds,
    },
  };
}

/** Можно ли допросить эту карточку своим персонажем */
export function canInterrogateTarget(
  board: BoardCharacter[],
  boardSize: number,
  selfCharacterId: string | undefined,
  targetCharacterId: string,
): boolean {
  if (selfCharacterId === undefined) return false;

  const selfIndex = findCharacterIndex(board, selfCharacterId);
  const targetIndex = findCharacterIndex(board, targetCharacterId);
  if (selfIndex === -1 || targetIndex === -1) return false;

  return areAdjacentOrSame(selfIndex, targetIndex, boardSize);
}
