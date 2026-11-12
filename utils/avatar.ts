import { blobatar } from "blobatar";

/** Имя-заглушка для пустого ника */
const FALLBACK_NAME = "Шпион";

/**
 * Кэш data: URI по имени: список игроков перерисовывается на каждое событие
 * комнаты, а генерация — это хеш плюс сборка SVG.
 */
const cache = new Map<string, string>();

/**
 * Детерминированная аватарка игрока: одно и то же имя всегда даёт одну и ту же
 * картинку, разные имена — разные картинки.
 *
 * Возвращает `data:` URI с SVG, поэтому её можно отдать в `<img src>` и на
 * сервере, и на клиенте. Подпуть `blobatar/uri` не используется: у пакета
 * ESM-only карта экспортов, а проект резолвит модули в режиме node10.
 */
export function getAvatarUri(name: string): string {
  const seed = name.trim() === "" ? FALLBACK_NAME : name.trim();
  const cached = cache.get(seed);

  if (cached !== undefined) return cached;

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(blobatar(seed))}`;

  cache.set(seed, uri);

  return uri;
}
