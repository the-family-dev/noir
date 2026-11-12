import { describe, expect, it } from "vitest";
import {
  generateCode,
  isValidRoomCode,
  ROOM_CODE_LENGTH,
  sanitizeRoomCode,
} from "../../utils/code-generaator";
import {
  getRoomInviteUrl,
  getRoomPath,
  normalizeRoomCode,
} from "../../utils/room-link";

describe("generateCode", () => {
  it("по умолчанию даёт код комнаты нужной длины из строчных букв", () => {
    const code = generateCode();

    expect(code).toHaveLength(ROOM_CODE_LENGTH);
    expect(code).toMatch(/^[a-z]+$/);
    expect(isValidRoomCode(code)).toBe(true);
  });

  it("уважает явную длину", () => {
    expect(generateCode(10)).toHaveLength(10);
    expect(generateCode(1)).toHaveLength(1);
  });

  it("почти не повторяется", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateCode()));

    expect(codes.size).toBe(50);
  });
});

describe("sanitizeRoomCode", () => {
  it("приводит код к нижнему регистру и убирает лишние символы", () => {
    const code = generateCode();

    expect(sanitizeRoomCode(code.toUpperCase())).toBe(code);
    expect(sanitizeRoomCode(` ${code.split("").join(" ")}!! `)).toBe(code);
    expect(sanitizeRoomCode(`${code}${"x".repeat(10)}`)).toBe(code);
  });

  it("вытаскивает код из вставленной ссылки-приглашения", () => {
    const code = generateCode();

    expect(sanitizeRoomCode(`http://localhost:3000/room/${code}`)).toBe(code);
    expect(
      sanitizeRoomCode(`https://noir.example/room/${code}?from=chat#top`),
    ).toBe(code);
    expect(sanitizeRoomCode(`/${code}`)).toBe(code);
  });

  it("возвращает пустую строку, если букв нет", () => {
    expect(sanitizeRoomCode("")).toBe("");
    expect(sanitizeRoomCode("12345 !?")).toBe("");
  });
});

describe("isValidRoomCode", () => {
  it("принимает только полный код из строчных букв", () => {
    const code = generateCode();

    expect(isValidRoomCode(code)).toBe(true);
    expect(isValidRoomCode(code.slice(1))).toBe(false);
    expect(isValidRoomCode(`${code}a`)).toBe(false);
    expect(isValidRoomCode(code.toUpperCase())).toBe(false);
    expect(isValidRoomCode(`${code.slice(0, -1)}1`)).toBe(false);
    expect(isValidRoomCode("")).toBe(false);
  });
});

describe("normalizeRoomCode", () => {
  it("берёт первый элемент массива, обрезает пробелы и приводит к нижнему регистру", () => {
    expect(normalizeRoomCode(" ABCDXY ")).toBe("abcdxy");
    expect(normalizeRoomCode(["abcdxy", "other"])).toBe("abcdxy");
    expect(normalizeRoomCode(undefined)).toBe("");
  });
});

describe("getRoomPath", () => {
  it("строит адрес комнаты и нормализует код", () => {
    expect(getRoomPath("ABCDXY")).toBe("/room/abcdxy");
    expect(getRoomPath(" abcdxy ")).toBe("/room/abcdxy");
  });
});

describe("getRoomInviteUrl", () => {
  it("склеивает origin и путь без двойного слэша", () => {
    expect(getRoomInviteUrl("abcdxy", "http://localhost:3000")).toBe(
      "http://localhost:3000/room/abcdxy",
    );
    expect(getRoomInviteUrl("ABCDXY", "https://noir.example/")).toBe(
      "https://noir.example/room/abcdxy",
    );
  });
});
