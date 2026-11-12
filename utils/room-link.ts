/**
 * Приводит сегмент адреса к коду комнаты: коды генерируются в нижнем регистре,
 * но в ссылке их могут написать капсом или с пробелом.
 */
export function normalizeRoomCode(code: string | string[] | undefined): string {
  const value = Array.isArray(code) ? code[0] : code;

  return (value ?? "").trim().toLowerCase();
}

/** Путь страницы комнаты — одна и та же ссылка-приглашение на клиенте и в тестах */
export function getRoomPath(roomCode: string): string {
  return `/room/${normalizeRoomCode(roomCode)}`;
}

/** Абсолютная ссылка-приглашение: её и отправляют друзьям */
export function getRoomInviteUrl(roomCode: string, origin: string): string {
  return `${origin.replace(/\/+$/, "")}${getRoomPath(roomCode)}`;
}
