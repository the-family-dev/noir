import { BoardCharacter, BoardCatch } from "@/server/types";
import { findCharacterIndex } from "@/utils/board-adjacency";
import { canInterrogateTarget } from "@/utils/interrogation";
import { shuffle } from "@/utils/shuffle";

export type ResolveCatchParams = {
  board: BoardCharacter[];
  boardRows: number;
  boardCols: number;
  assignments: Record<string, string>;
  actorSessionId: string;
  targetCharacterId: string;
  /** Кого обвиняют: «это личность этого игрока?» */
  accusedSessionId: string;
  seq: number;
};

export type ResolveCatchResult =
  | {
      ok: true;
      catchResult: BoardCatch;
      board: BoardCharacter[];
      assignments: Record<string, string>;
    }
  | {
      ok: false;
      reason:
        | "actor_missing"
        | "target_missing"
        | "target_dead"
        | "accused_missing"
        | "not_adjacent"
        | "self_target";
    };

/**
 * Попытка поймать: угадал ли actor, что target — личность accused.
 * При попадании карточка помечается убитой, accused получает новую свободную.
 */
export function resolveCatch(
  params: ResolveCatchParams,
): ResolveCatchResult {
  const {
    board,
    boardRows,
    boardCols,
    assignments,
    actorSessionId,
    targetCharacterId,
    accusedSessionId,
    seq,
  } = params;

  if (assignments[actorSessionId] === undefined) {
    return { ok: false, reason: "actor_missing" };
  }

  if (assignments[accusedSessionId] === undefined) {
    return { ok: false, reason: "accused_missing" };
  }

  const targetIndex = findCharacterIndex(board, targetCharacterId);
  if (targetIndex === -1) {
    return { ok: false, reason: "target_missing" };
  }

  const target = board[targetIndex]!;
  if (target.isDead) {
    return { ok: false, reason: "target_dead" };
  }

  if (
    !canInterrogateTarget(
      board,
      boardRows,
      boardCols,
      assignments[actorSessionId],
      targetCharacterId,
    )
  ) {
    return { ok: false, reason: "not_adjacent" };
  }

  // Свою карточку ловить нельзя
  if (assignments[actorSessionId] === targetCharacterId) {
    return { ok: false, reason: "self_target" };
  }

  const hit = assignments[accusedSessionId] === targetCharacterId;

  let nextBoard = board.map((c) => ({ ...c }));
  let nextAssignments = { ...assignments };

  if (hit) {
    nextBoard = nextBoard.map((c) =>
      c.id === targetCharacterId ? { ...c, isDead: true } : c,
    );

    const occupiedByOthers = new Set(
      Object.entries(assignments)
        .filter(([sessionId]) => sessionId !== accusedSessionId)
        .map(([, characterId]) => characterId),
    );

    const freeLiving = nextBoard.filter(
      (c) => !c.isDead && !occupiedByOthers.has(c.id),
    );
    const nextIdentity = shuffle(freeLiving)[0];

    if (nextIdentity !== undefined) {
      nextAssignments[accusedSessionId] = nextIdentity.id;
    } else {
      // Свободных карточек нет — игрок остаётся без личности
      delete nextAssignments[accusedSessionId];
    }
  }

  return {
    ok: true,
    catchResult: {
      seq,
      actorSessionId,
      targetCharacterId,
      accusedSessionId,
      hit,
    },
    board: nextBoard,
    assignments: nextAssignments,
  };
}

/** Можно ли поймать карточку (жива, рядом, и не своя личность) */
export function canCatchTarget(
  board: BoardCharacter[],
  boardRows: number,
  boardCols: number,
  selfCharacterId: string | undefined,
  targetCharacterId: string,
): boolean {
  if (selfCharacterId === undefined) return false;
  // Ловить свою карточку бессмысленно
  if (targetCharacterId === selfCharacterId) return false;

  const target = board.find((c) => c.id === targetCharacterId);
  if (target === undefined || target.isDead) return false;

  return canInterrogateTarget(
    board,
    boardRows,
    boardCols,
    selfCharacterId,
    targetCharacterId,
  );
}
