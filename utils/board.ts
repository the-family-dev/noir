/**
 * Общие помощники для игрового поля.
 * Используются и сервером, и клиентом, поэтому не содержат серверной логики.
 */

/** Координаты клетки по её индексу в построчном массиве */
export function getRowColumn(
  size: number,
  index: number,
): { row: number; column: number } {
  return { row: Math.floor(index / size), column: index % size };
}

/**
 * Индексы соседних клеток: по горизонтали, вертикали и диагонали
 * (до 8 клеток вокруг выбранной).
 */
export function getAdjacentIndexes(size: number, index: number): number[] {
  if (index < 0 || index >= size * size) return [];

  const { row, column } = getRowColumn(size, index);
  const result: number[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
      if (rowOffset === 0 && columnOffset === 0) continue;

      const neighborRow = row + rowOffset;
      const neighborColumn = column + columnOffset;

      if (neighborRow < 0 || neighborRow >= size) continue;
      if (neighborColumn < 0 || neighborColumn >= size) continue;

      result.push(neighborRow * size + neighborColumn);
    }
  }

  return result;
}

/** Человеческое описание места на поле: «ряд 2, место 3» */
export function getLocationLabel(size: number, index: number): string {
  if (index < 0) return "вне поля";
  const { row, column } = getRowColumn(size, index);
  return `ряд ${row + 1}, место ${column + 1}`;
}
