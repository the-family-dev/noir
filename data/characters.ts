export type TCharacter = {
  id: string;
  name: string;
};

export const MIN_BOARD_SIZE = 4;
export const MAX_BOARD_SIZE = 7;
export const DEFAULT_BOARD_SIZE = 5;

const NAMES = [
  "Виктор Грей",
  "Лилит Ворон",
  "Макс Шейд",
  "Ева Смоук",
  "Иван Блэк",
  "Нора Фог",
  "Алекс Нуар",
  "Мира Вейл",
  "Роман Даск",
  "София Рейн",
  "Дмитрий Кроу",
  "Анна Блейд",
  "Кирилл Эш",
  "Ольга Стил",
  "Павел Морн",
  "Ирина Глейс",
  "Сергей Вулф",
  "Катя Шарп",
  "Артём Фокс",
  "Лена Квин",
  "Никита Грим",
  "Юлия Найф",
  "Олег Старк",
  "Вера Лок",
  "Денис Слейт",
  "Мария Вакс",
  "Глеб Роук",
  "Таня Бёрн",
  "Илья Клей",
  "Света Хейз",
  "Борис Торн",
  "Алиса Вейн",
  "Юрий Блэйз",
  "Надя Фрост",
  "Рустам Шейд",
  "Зоя Кросс",
  "Тимур Вейл",
  "Лиза Дрейк",
  "Фёдор Грейв",
  "Полина Скай",
  "Андрей Холт",
  "Даша Рид",
  "Вадим Кейдж",
  "Ксения Мор",
  "Егор Прайм",
  "Инна Коул",
  "Стас Вейт",
  "Рита Блэк",
  "Лев Сторм",
  "Эмма Шейд",
] as const;

export const CHARACTERS: TCharacter[] = NAMES.map((name, index) => ({
  id: `char-${index + 1}`,
  name,
}));

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickCharacters(count: number): TCharacter[] {
  if (count <= 0) return [];
  if (count >= CHARACTERS.length) return shuffle(CHARACTERS);
  return shuffle(CHARACTERS).slice(0, count);
}
