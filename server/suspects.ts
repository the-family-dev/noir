import { TSuspect } from "./types";

/**
 * Подозреваемые города. Максимальное игровое поле — 7×7 (49 клеток),
 * поэтому в колоде должно быть не меньше 49 персонажей.
 */
export const NOIR_SUSPECTS: TSuspect[] = [
  { id: "don-moretti", name: "Дон Моретти", role: "глава мафии" },
  { id: "miss-lorraine", name: "Мисс Лоррейн", role: "певица кабаре" },
  { id: "detective-kane", name: "Детектив Кейн", role: "частный сыщик" },
  { id: "sal-shadow", name: "Сэл «Тень»", role: "карманник" },
  { id: "madame-rochelle", name: "Мадам Рошель", role: "гадалка" },
  { id: "barney-dax", name: "Барни Дакс", role: "бармен" },
  { id: "lola-winters", name: "Лола Винтерс", role: "танцовщица" },
  { id: "professor-stolz", name: "Профессор Штольц", role: "химик" },
  { id: "roxy-courier", name: "Рокси", role: "курьер" },
  { id: "doctor-moreau", name: "Доктор Моро", role: "патологоанатом" },
  { id: "harry-ace", name: "Гарри «Туз»", role: "шулер" },
  { id: "vivien-lane", name: "Вивьен Лейн", role: "журналистка" },
  { id: "captain-holt", name: "Капитан Холт", role: "полицейский" },
  { id: "tony-sorro", name: "Тони Сорро", role: "телохранитель" },
  { id: "nora-quinn", name: "Нора Квин", role: "воровка" },
  { id: "felix-gray", name: "Феликс Грей", role: "бухгалтер" },
  { id: "gloria-mars", name: "Глория Марс", role: "актриса" },
  { id: "jack-blade", name: "Джек «Лезвие»", role: "мясник" },
  { id: "edith-stone", name: "Эдит Стоун", role: "адвокат" },
  { id: "ray-black", name: "Рэй Блэк", role: "водитель" },
  { id: "major-pierce", name: "Майор Пирс", role: "отставной военный" },
  { id: "celeste", name: "Селеста", role: "цветочница" },
  { id: "otto-kranz", name: "Отто Кранц", role: "часовщик" },
  { id: "lucy-flame", name: "Люси Флэйм", role: "джазовая певица" },
  { id: "sam-gutter", name: "Сэм Гаттер", role: "мусорщик" },
  { id: "agnes-pike", name: "Агнес Пайк", role: "медсестра" },
  { id: "julian-frost", name: "Джулиан Фрост", role: "ювелир" },
  { id: "margo-blackwood", name: "Марго Блэквуд", role: "вдова" },
  { id: "irwin-park", name: "Ирвин Парк", role: "фотограф" },
  { id: "butch-crow", name: "Бутч Кроу", role: "боксёр" },
  { id: "daphne-rose", name: "Дафна Роуз", role: "модель" },
  { id: "leo-strang", name: "Лео Штранг", role: "ростовщик" },
  { id: "clara-knox", name: "Клара Нокс", role: "библиотекарь" },
  { id: "frank-hammer", name: "Фрэнк Молот", role: "докер" },
  { id: "elsa-moor", name: "Эльза Мор", role: "радистка" },
  { id: "mickey-sparks", name: "Микки Спаркс", role: "механик" },
  { id: "cindy-larue", name: "Синди Ларю", role: "официантка" },
  { id: "archie-bate", name: "Арчи Бейт", role: "рыбак" },
  { id: "hans-werner", name: "Ганс Вернер", role: "инженер" },
  { id: "pete-bone", name: "Пит «Кость»", role: "коллектор" },
  { id: "isabel-cross", name: "Изабель Кросс", role: "скрипачка" },
  { id: "ralph-goodwin", name: "Ральф Гудвин", role: "страховщик" },
  { id: "tilly-banks", name: "Тилли Бэнкс", role: "кассир" },
  { id: "maurice-black", name: "Морис Блэк", role: "импресарио" },
  { id: "ginger-stone", name: "Джинджер Стоун", role: "стенографистка" },
  { id: "sol-brick", name: "Сол Брик", role: "строитель" },
  { id: "nelly-fox", name: "Нелли Фокс", role: "аферистка" },
  { id: "victor-lange", name: "Виктор Ланге", role: "дипломат" },
  { id: "june-cat", name: "Джун Кэт", role: "пианистка" },
  { id: "oscar-lind", name: "Оскар Линд", role: "аптекарь" },
  { id: "pat-malloy", name: "Пэт Маллой", role: "полицейский" },
  { id: "ada-wolf", name: "Ада Вольф", role: "писательница" },
  { id: "ruben-steel", name: "Рубен Сталь", role: "сварщик" },
  { id: "betty-dale", name: "Бетти Дэйл", role: "телефонистка" },
  { id: "quincy-adams", name: "Куинси Адамс", role: "нотариус" },
  { id: "sadie-hawk", name: "Сэди Хоук", role: "хозяйка отеля" },
];

export const SUSPECTS_BY_ID: Record<string, TSuspect> = NOIR_SUSPECTS.reduce(
  (acc, suspect) => {
    acc[suspect.id] = suspect;
    return acc;
  },
  {} as Record<string, TSuspect>,
);

const UNKNOWN_SUSPECT: TSuspect = {
  id: "unknown",
  name: "Неизвестный",
  role: "подозреваемый",
};

export function getSuspect(suspectId: string | undefined): TSuspect {
  if (!suspectId) return UNKNOWN_SUSPECT;
  return SUSPECTS_BY_ID[suspectId] ?? UNKNOWN_SUSPECT;
}

export function getSuspectName(suspectId: string | undefined): string {
  return getSuspect(suspectId).name;
}

/** Монограмма для карточки: «Дон Моретти» → «ДМ» */
export function getMonogram(name: string): string {
  const words = name
    .replace(/[«»"'.]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";

  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return initials.length > 0 ? initials : "?";
}
