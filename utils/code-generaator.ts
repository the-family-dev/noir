/**
 * Длина кода комнаты. Код попадает в ссылку-приглашение (/room/<код>) и его
 * набирают руками, поэтому алфавит — только строчные латинские буквы.
 */
export const ROOM_CODE_LENGTH = 6;

const CODE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";

export function generateCode(length = ROOM_CODE_LENGTH): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CODE_CHARACTERS.charAt(
      Math.floor(Math.random() * CODE_CHARACTERS.length),
    );
  }
  return result;
}

/**
 * Приводит ввод игрока к виду кода: нижний регистр, только буквы, не длиннее
 * кода комнаты. Понимает и вставленную целиком ссылку-приглашение.
 */
export function sanitizeRoomCode(value: string): string {
  const withoutQuery = value.split(/[?#]/)[0];
  const lastSegment = withoutQuery.split("/").filter(Boolean).pop() ?? "";

  return lastSegment
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, ROOM_CODE_LENGTH);
}

/** Похоже ли значение на полный код комнаты */
export function isValidRoomCode(value: string): boolean {
  return new RegExp(`^[a-z]{${ROOM_CODE_LENGTH}}$`).test(value);
}
