import { BoardCharacter, BoardRefreshAxis } from "@/server/types";

/** В каждой строке есть хотя бы один погибший */
export function everyRowHasDead(
  board: BoardCharacter[],
  rows: number,
  cols: number,
): boolean {
  if (rows <= 0 || cols <= 0 || board.length !== rows * cols) return false;

  for (let row = 0; row < rows; row++) {
    let hasDead = false;
    for (let col = 0; col < cols; col++) {
      if (board[row * cols + col]?.isDead) {
        hasDead = true;
        break;
      }
    }
    if (!hasDead) return false;
  }
  return true;
}

/** В каждом столбце есть хотя бы один погибший */
export function everyColumnHasDead(
  board: BoardCharacter[],
  rows: number,
  cols: number,
): boolean {
  if (rows <= 0 || cols <= 0 || board.length !== rows * cols) return false;

  for (let col = 0; col < cols; col++) {
    let hasDead = false;
    for (let row = 0; row < rows; row++) {
      if (board[row * cols + col]?.isDead) {
        hasDead = true;
        break;
      }
    }
    if (!hasDead) return false;
  }
  return true;
}

export function canRefreshBoard(
  board: BoardCharacter[],
  rows: number,
  cols: number,
  axis: BoardRefreshAxis,
): boolean {
  if (axis === "row") {
    // Сомкнуть по строкам → ширина уменьшается на 1
    if (cols <= 1) return false;
    return everyRowHasDead(board, rows, cols);
  }
  // Сомкнуть по столбцам → высота уменьшается на 1
  if (rows <= 1) return false;
  return everyColumnHasDead(board, rows, cols);
}

export type BoardRefreshResult = {
  board: BoardCharacter[];
  rows: number;
  cols: number;
};

/**
 * Обновление поля: убрать по одному погибшему из каждой строки/столбца
 * и сомкнуть оставшиеся карточки (поле становится прямоугольником).
 */
export function refreshBoard(
  board: BoardCharacter[],
  rows: number,
  cols: number,
  axis: BoardRefreshAxis,
): BoardRefreshResult | null {
  if (!canRefreshBoard(board, rows, cols, axis)) return null;

  if (axis === "row") {
    const next: BoardCharacter[] = [];
    for (let row = 0; row < rows; row++) {
      let removed = false;
      for (let col = 0; col < cols; col++) {
        const cell = board[row * cols + col]!;
        if (!removed && cell.isDead) {
          removed = true;
          continue;
        }
        next.push(cell);
      }
    }
    return { board: next, rows, cols: cols - 1 };
  }

  const columns: BoardCharacter[][] = [];
  for (let col = 0; col < cols; col++) {
    const line: BoardCharacter[] = [];
    let removed = false;
    for (let row = 0; row < rows; row++) {
      const cell = board[row * cols + col]!;
      if (!removed && cell.isDead) {
        removed = true;
        continue;
      }
      line.push(cell);
    }
    columns.push(line);
  }

  const newRows = rows - 1;
  const next: BoardCharacter[] = [];
  for (let row = 0; row < newRows; row++) {
    for (let col = 0; col < cols; col++) {
      next.push(columns[col]![row]!);
    }
  }
  return { board: next, rows: newRows, cols };
}
