import { describe, expect, it } from "vitest";
import {
  getAdjacentIndexes,
  getLocationLabel,
  getRowColumn,
} from "../../utils/board";

describe("getRowColumn", () => {
  it("переводит индекс в координаты", () => {
    expect(getRowColumn(5, 0)).toEqual({ row: 0, column: 0 });
    expect(getRowColumn(5, 6)).toEqual({ row: 1, column: 1 });
    expect(getRowColumn(5, 24)).toEqual({ row: 4, column: 4 });
    expect(getRowColumn(7, 48)).toEqual({ row: 6, column: 6 });
  });
});

describe("getAdjacentIndexes", () => {
  it("находит соседей в углу, включая диагональ", () => {
    expect(getAdjacentIndexes(5, 0).sort((a, b) => a - b)).toEqual([1, 5, 6]);
    expect(getAdjacentIndexes(5, 24).sort((a, b) => a - b)).toEqual([
      18, 19, 23,
    ]);
  });

  it("находит соседей в центре, включая диагонали", () => {
    expect(getAdjacentIndexes(5, 12).sort((a, b) => a - b)).toEqual([
      6, 7, 8, 11, 13, 16, 17, 18,
    ]);
  });

  it("находит соседей на краю поля", () => {
    expect(getAdjacentIndexes(5, 4).sort((a, b) => a - b)).toEqual([3, 8, 9]);
  });

  it("не включает саму клетку", () => {
    expect(getAdjacentIndexes(5, 12)).not.toContain(12);
  });

  it("не выходит за границы поля", () => {
    expect(getAdjacentIndexes(5, -1)).toEqual([]);
    expect(getAdjacentIndexes(5, 25)).toEqual([]);
  });

  it("учитывает размер поля", () => {
    expect(getAdjacentIndexes(7, 24).sort((a, b) => a - b)).toEqual([
      16, 17, 18, 23, 25, 30, 31, 32,
    ]);
  });
});

describe("getLocationLabel", () => {
  it("описывает место на поле", () => {
    expect(getLocationLabel(5, 0)).toBe("ряд 1, место 1");
    expect(getLocationLabel(5, 7)).toBe("ряд 2, место 3");
    expect(getLocationLabel(7, 48)).toBe("ряд 7, место 7");
  });

  it("обрабатывает отсутствие позиции", () => {
    expect(getLocationLabel(5, -1)).toBe("вне поля");
  });
});
