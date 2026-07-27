import {
  BoardCharacter,
  BoardShift,
} from "@/server/types";

/**
 * Циклический сдвиг строки или столбца на 1 клетку.
 * positive по строке: 1→2, 2→3, …, последний→первый.
 */
export function shiftBoardLine<T>(
  board: T[],
  size: number,
  shift: BoardShift,
): T[] {
  const { axis, index, direction } = shift;

  if (size <= 0 || board.length !== size * size) {
    return board;
  }
  if (index < 0 || index >= size) {
    return board;
  }

  const next = [...board];

  if (axis === "row") {
    const start = index * size;
    const line = next.slice(start, start + size);
    const rotated =
      direction === "positive"
        ? [line[size - 1]!, ...line.slice(0, size - 1)]
        : [...line.slice(1), line[0]!];
    next.splice(start, size, ...rotated);
    return next;
  }

  const line: T[] = [];
  for (let row = 0; row < size; row++) {
    line.push(next[row * size + index]!);
  }
  const rotated =
    direction === "positive"
      ? [line[size - 1]!, ...line.slice(0, size - 1)]
      : [...line.slice(1), line[0]!];
  for (let row = 0; row < size; row++) {
    next[row * size + index] = rotated[row]!;
  }
  return next;
}

export function shiftBoardCharacters(
  board: BoardCharacter[],
  size: number,
  shift: BoardShift,
): BoardCharacter[] {
  return shiftBoardLine(board, size, shift);
}

/** Откат сдвига: из доски «после» получаем доску «до» */
export function reverseBoardShift(
  board: BoardCharacter[],
  size: number,
  shift: BoardShift,
): BoardCharacter[] {
  return shiftBoardCharacters(board, size, {
    ...shift,
    direction: shift.direction === "positive" ? "negative" : "positive",
  });
}

export function isValidBoardShift(
  size: number,
  shift: BoardShift,
): boolean {
  return (
    Number.isInteger(shift.index) &&
    shift.index >= 0 &&
    shift.index < size &&
    (shift.axis === "row" || shift.axis === "column") &&
    (shift.direction === "positive" || shift.direction === "negative")
  );
}

export function boardsEqual(
  a: BoardCharacter[],
  b: BoardCharacter[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((cell, i) => cell.id === b[i]?.id);
}

/** Достаёт персонажей одной строки/столбца */
export function getLineCharacters(
  board: BoardCharacter[],
  size: number,
  shift: BoardShift,
): BoardCharacter[] {
  if (shift.axis === "row") {
    const start = shift.index * size;
    return board.slice(start, start + size);
  }
  const line: BoardCharacter[] = [];
  for (let row = 0; row < size; row++) {
    line.push(board[row * size + shift.index]!);
  }
  return line;
}

/** Strip для карусели: лишняя карточка с нужной стороны */
export function buildCarouselStrip(
  lineBefore: BoardCharacter[],
  direction: BoardShift["direction"],
): BoardCharacter[] {
  if (direction === "positive") {
    return [lineBefore[lineBefore.length - 1]!, ...lineBefore];
  }
  return [...lineBefore, lineBefore[0]!];
}

export function stepOffset(
  direction: BoardShift["direction"],
  at: "start" | "end",
): number {
  const start = direction === "positive" ? -1 : 0;
  const end = direction === "positive" ? 0 : -1;
  return at === "start" ? start : end;
}

/**
 * Определяет параметры сдвига по доскам «до» и «после».
 * Возвращает null, если доски не отличаются одним циклическим сдвигом.
 */
export function detectBoardShift(
  boardBefore: BoardCharacter[],
  boardAfter: BoardCharacter[],
  size: number,
): BoardShift | null {
  if (boardBefore.length !== size * size) return null;
  if (boardAfter.length !== size * size) return null;
  if (boardsEqual(boardBefore, boardAfter)) return null;

  const axes: BoardShift["axis"][] = ["row", "column"];
  const directions: BoardShift["direction"][] = ["positive", "negative"];

  for (const axis of axes) {
    for (let index = 0; index < size; index++) {
      for (const direction of directions) {
        const shift: BoardShift = { axis, index, direction };
        const candidate = shiftBoardCharacters(boardBefore, size, shift);
        if (boardsEqual(candidate, boardAfter)) {
          return shift;
        }
      }
    }
  }

  return null;
}

export const BOARD_SHIFT_ANIMATION_MS = 650;
export const BOARD_GAP = 6;
export const BOARD_SHIFT_EASE = [0.25, 0.1, 0.25, 1] as const;
