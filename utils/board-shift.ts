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

export const BOARD_GAP = 6;
