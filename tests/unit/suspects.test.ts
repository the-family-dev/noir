import { describe, expect, it } from "vitest";
import {
  NOIR_SUSPECTS,
  getMonogram,
  getSuspect,
  getSuspectName,
} from "../../server/suspects";

describe("NOIR_SUSPECTS", () => {
  it("содержит достаточно персонажей для поля 7×7", () => {
    expect(NOIR_SUSPECTS.length).toBeGreaterThanOrEqual(49);
  });

  it("не содержит дублей id", () => {
    const ids = NOIR_SUSPECTS.map((suspect) => suspect.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("у каждого персонажа есть имя и занятие", () => {
    NOIR_SUSPECTS.forEach((suspect) => {
      expect(suspect.name.trim().length).toBeGreaterThan(0);
      expect(suspect.role.trim().length).toBeGreaterThan(0);
    });
  });
});

describe("getSuspect", () => {
  it("возвращает персонажа по id", () => {
    const [first] = NOIR_SUSPECTS;
    expect(getSuspect(first.id)).toEqual(first);
  });

  it("возвращает заглушку для неизвестного id", () => {
    expect(getSuspect("no-such-suspect")).toEqual({
      id: "unknown",
      name: "Неизвестный",
      role: "подозреваемый",
    });
    expect(getSuspect(undefined).name).toBe("Неизвестный");
  });
});

describe("getSuspectName", () => {
  it("возвращает имя или заглушку", () => {
    const [first] = NOIR_SUSPECTS;
    expect(getSuspectName(first.id)).toBe(first.name);
    expect(getSuspectName(undefined)).toBe("Неизвестный");
  });
});

describe("getMonogram", () => {
  it("берёт первые буквы двух слов", () => {
    expect(getMonogram("Дон Моретти")).toBe("ДМ");
  });

  it("игнорирует кавычки и лишние пробелы", () => {
    expect(getMonogram("Сэл «Тень»")).toBe("СТ");
    expect(getMonogram("  Селеста  ")).toBe("С");
  });

  it("возвращает заглушку для пустой строки", () => {
    expect(getMonogram("")).toBe("?");
    expect(getMonogram("   ")).toBe("?");
  });
});
