import { BoardCharacter } from "@/server/types";

/** Смещения к 8 соседним клеткам (ортогональ + диагонали), без тора */
const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function indexToCoord(
  index: number,
  cols: number,
): { row: number; col: number } {
  return { row: Math.floor(index / cols), col: index % cols };
}

export function coordToIndex(row: number, col: number, cols: number): number {
  return row * cols + col;
}

export function findCharacterIndex(
  board: BoardCharacter[],
  characterId: string,
): number {
  return board.findIndex((c) => c.id === characterId);
}

/** Индексы соседних клеток (до 8), без выхода за край */
export function getNeighborIndices(
  index: number,
  rows: number,
  cols: number,
): number[] {
  if (rows <= 0 || cols <= 0 || index < 0 || index >= rows * cols) return [];

  const { row, col } = indexToCoord(index, cols);
  const result: number[] = [];

  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const nextRow = row + dr;
    const nextCol = col + dc;
    if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
      continue;
    }
    result.push(coordToIndex(nextRow, nextCol, cols));
  }

  return result;
}

/** Рядом = 8 направлений; клетка рядом сама с собой (для самодопроса) */
export function areAdjacentOrSame(
  aIndex: number,
  bIndex: number,
  rows: number,
  cols: number,
): boolean {
  if (aIndex === bIndex) return true;
  return getNeighborIndices(aIndex, rows, cols).includes(bIndex);
}

/**
 * sessionId игроков, чьи личности стоят на указанных индексах доски.
 * Несколько игроков на одну клетку невозможно — один персонаж на клетку.
 */
export function sessionIdsAtBoardIndices(
  board: BoardCharacter[],
  assignments: Record<string, string>,
  indices: Iterable<number>,
): string[] {
  const characterIds = new Set<string>();
  for (const index of indices) {
    const character = board[index];
    if (character) characterIds.add(character.id);
  }

  const sessionIds: string[] = [];
  for (const [sessionId, characterId] of Object.entries(assignments)) {
    if (characterIds.has(characterId)) {
      sessionIds.push(sessionId);
    }
  }
  return sessionIds;
}
