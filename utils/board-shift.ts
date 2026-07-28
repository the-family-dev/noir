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
  rows: number,
  cols: number,
  shift: BoardShift,
): T[] {
  const { axis, index, direction } = shift;

  if (rows <= 0 || cols <= 0 || board.length !== rows * cols) {
    return board;
  }

  if (axis === "row") {
    if (index < 0 || index >= rows) return board;
    const next = [...board];
    const start = index * cols;
    const line = next.slice(start, start + cols);
    const rotated =
      direction === "positive"
        ? [line[cols - 1]!, ...line.slice(0, cols - 1)]
        : [...line.slice(1), line[0]!];
    next.splice(start, cols, ...rotated);
    return next;
  }

  if (index < 0 || index >= cols) return board;
  const next = [...board];
  const line: T[] = [];
  for (let row = 0; row < rows; row++) {
    line.push(next[row * cols + index]!);
  }
  const rotated =
    direction === "positive"
      ? [line[rows - 1]!, ...line.slice(0, rows - 1)]
      : [...line.slice(1), line[0]!];
  for (let row = 0; row < rows; row++) {
    next[row * cols + index] = rotated[row]!;
  }
  return next;
}

export function shiftBoardCharacters(
  board: BoardCharacter[],
  rows: number,
  cols: number,
  shift: BoardShift,
): BoardCharacter[] {
  return shiftBoardLine(board, rows, cols, shift);
}

/** Откат сдвига: из доски «после» получаем доску «до» */
export function reverseBoardShift(
  board: BoardCharacter[],
  rows: number,
  cols: number,
  shift: BoardShift,
): BoardCharacter[] {
  return shiftBoardCharacters(board, rows, cols, {
    ...shift,
    direction: shift.direction === "positive" ? "negative" : "positive",
  });
}

export function isValidBoardShift(
  rows: number,
  cols: number,
  shift: BoardShift,
): boolean {
  const maxIndex = shift.axis === "row" ? rows : cols;
  return (
    Number.isInteger(shift.index) &&
    shift.index >= 0 &&
    shift.index < maxIndex &&
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
  rows: number,
  cols: number,
  shift: BoardShift,
): BoardCharacter[] {
  if (shift.axis === "row") {
    const start = shift.index * cols;
    return board.slice(start, start + cols);
  }
  const line: BoardCharacter[] = [];
  for (let row = 0; row < rows; row++) {
    line.push(board[row * cols + shift.index]!);
  }
  return line;
}

/** Подпись направления сдвига для UI */
export function shiftDirectionLabel(shift: BoardShift): string {
  if (shift.axis === "row") {
    return shift.direction === "positive" ? "вправо" : "влево";
  }
  return shift.direction === "positive" ? "вниз" : "вверх";
}

/** «ряд» / «столбец» */
export function shiftAxisLabel(axis: BoardShift["axis"]): string {
  return axis === "row" ? "ряд" : "столбец";
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
  rows: number,
  cols: number,
): BoardShift | null {
  if (boardBefore.length !== rows * cols) return null;
  if (boardAfter.length !== rows * cols) return null;
  if (boardsEqual(boardBefore, boardAfter)) return null;

  const axes: BoardShift["axis"][] = ["row", "column"];
  const directions: BoardShift["direction"][] = ["positive", "negative"];

  for (const axis of axes) {
    const maxIndex = axis === "row" ? rows : cols;
    for (let index = 0; index < maxIndex; index++) {
      for (const direction of directions) {
        const shift: BoardShift = { axis, index, direction };
        const candidate = shiftBoardCharacters(boardBefore, rows, cols, shift);
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
