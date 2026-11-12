import {
  GamePhase,
  TBoardCell,
  TGame,
  TGameAction,
  TGamePlayer,
  TGameView,
  TLogKind,
  TPlayerView,
  TRoom,
  TRoomView,
} from "./types";
import { NOIR_SUSPECTS, getSuspect } from "./suspects";
import { getAdjacentIndexes, getLocationLabel } from "../utils/board";

export { getAdjacentIndexes, getLocationLabel };

/** Допустимое число игроков по правилам сценария «Шпионские игры» */
export const ALLOWED_PLAYER_COUNTS = [3, 4, 5, 6, 8, 9];

export type TActionSuccess = { ok: true };
export type TActionFailure = { ok: false; error: string };
export type TActionResult = TActionSuccess | TActionFailure;

const ok = (): TActionSuccess => ({ ok: true });
const fail = (error: string): TActionFailure => ({ ok: false, error });

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const buffer = items[index];
    items[index] = items[randomIndex];
    items[randomIndex] = buffer;
  }
  return items;
}

/** Размер поля: 5×5 для 3-4 игроков, 6×6 для 5-6, 7×7 для 8-9 */
export function getBoardSize(playerCount: number): number {
  if (playerCount <= 4) return 5;
  if (playerCount <= 6) return 6;
  return 7;
}

/** Сколько трофеев нужно для победы */
export function getTargetTrophies(playerCount: number): number {
  if (playerCount <= 3) return 4;
  if (playerCount <= 5) return 3;
  return 2;
}

/** Причина, по которой нельзя начать игру (undefined — можно начинать) */
export function getStartBlockReason(playerCount: number): string | undefined {
  if (playerCount < 3) {
    return `Нужно ещё ${3 - playerCount} игрока: минимум 3 участника`;
  }
  if (playerCount === 7) {
    return "7 игроков не поддерживается: пригласите 8-го игрока";
  }
  if (playerCount > 9) {
    return "Максимум 9 игроков";
  }
  return undefined;
}

export function getPlayerCellIndex(game: TGame, player: TGamePlayer): number {
  if (!player.identityId) return -1;
  return game.board.findIndex((cell) => cell.suspectId === player.identityId);
}

function addLog(game: TGame, kind: TLogKind, text: string) {
  const lastId = game.log.length > 0 ? game.log[game.log.length - 1].id : 0;
  game.log.push({ id: lastId + 1, kind, text });
  if (game.log.length > 60) {
    game.log.splice(0, game.log.length - 60);
  }
}

function drawIdentity(game: TGame): string | undefined {
  // Карта «погибшего» подозреваемого уже лежит трофеем на руках — личностью
  // она стать не может, иначе игрока нельзя поймать: его клетка мертва.
  game.deck = game.deck.filter((suspectId) => {
    const cell = game.board.find((item) => item.suspectId === suspectId);
    return cell !== undefined && !cell.dead;
  });

  if (game.deck.length === 0) return undefined;
  const index = Math.floor(Math.random() * game.deck.length);
  return game.deck.splice(index, 1)[0];
}

function finishGame(game: TGame, winnerId: string | undefined, text: string) {
  game.phase = GamePhase.Finished;
  game.winnerId = winnerId;
  game.lastInterrogation = undefined;
  addLog(game, "win", text);
}

function finishByDeckEnd(room: TRoom, game: TGame) {
  const sorted = [...room.users].sort(
    (left, right) => right.trophies.length - left.trophies.length,
  );
  const leader = sorted[0];

  if (leader === undefined) {
    finishGame(game, undefined, "Колода доказательств закончилась. Победитель не определён.");
    return;
  }

  const isTie = sorted.length > 1 && sorted[1].trophies.length === leader.trophies.length;

  if (isTie) {
    finishGame(game, undefined, "Колода доказательств закончилась. Ничья по числу трофеев!");
    return;
  }

  finishGame(
    game,
    leader.id,
    `Колода доказательств закончилась. Побеждает ${leader.name}: ${leader.trophies.length} трофея!`,
  );
}


// ------------------------------- Создание игры -------------------------------

export function createGame(room: TRoom): TActionResult {
  const playerCount = room.users.length;
  const blockReason = getStartBlockReason(playerCount);

  if (blockReason !== undefined) return fail(blockReason);

  const size = getBoardSize(playerCount);
  const boardSuspectIds = shuffle(NOIR_SUSPECTS.map((suspect) => suspect.id)).slice(
    0,
    size * size,
  );

  const board: TBoardCell[] = shuffle([...boardSuspectIds]).map((suspectId) => ({
    suspectId,
    dead: false,
  }));

  // Колода доказательств: по одной карте на каждого подозреваемого на поле
  const identities = shuffle([...boardSuspectIds]).slice(0, playerCount);
  const deck = boardSuspectIds.filter((suspectId) => !identities.includes(suspectId));

  // Случайный первый ход, но сам список игроков не перемешиваем: порядок в
  // комнате стабилен, а флаг создателя привязан к конкретному игроку.
  const turnIndex = Math.floor(Math.random() * room.users.length);

  room.users.forEach((user, index) => {
    user.trophies = [];
    user.identityId = identities[index];
  });

  const targetTrophies = getTargetTrophies(playerCount);

  room.game = {
    phase: GamePhase.Playing,
    size,
    board,
    deck,
    turnIndex,
    targetTrophies,
    log: [],
  };

  addLog(
    room.game,
    "info",
    `Игра началась: ${playerCount} шпионов, поле ${size}×${size}, в колоде доказательств ${deck.length} карт.`,
  );
  addLog(
    room.game,
    "info",
    `Цель — собрать ${targetTrophies} трофея. Первым ходит ${room.users[turnIndex].name}.`,
  );

  return ok();
}

export function resetGame(room: TRoom): TActionResult {
  room.game = undefined;
  room.users.forEach((user) => {
    user.trophies = [];
    user.identityId = undefined;
  });
  return ok();
}

// ------------------------------- Действия на поле -------------------------------

export function shiftRow(game: TGame, row: number, direction: 1 | -1): TActionResult {
  if (!Number.isInteger(row) || row < 0 || row >= game.size) {
    return fail("Такого ряда нет");
  }

  const size = game.size;
  const start = row * size;
  const cells = game.board.slice(start, start + size);
  const shifted: TBoardCell[] = [];

  for (let index = 0; index < size; index++) {
    shifted[(index + direction + size) % size] = cells[index];
  }

  for (let index = 0; index < size; index++) {
    game.board[start + index] = shifted[index];
  }

  return ok();
}

export function shiftColumn(game: TGame, column: number, direction: 1 | -1): TActionResult {
  if (!Number.isInteger(column) || column < 0 || column >= game.size) {
    return fail("Такого столбца нет");
  }

  const size = game.size;
  const cells: TBoardCell[] = [];

  for (let row = 0; row < size; row++) {
    cells.push(game.board[row * size + column]);
  }

  for (let row = 0; row < size; row++) {
    game.board[((row + direction + size) % size) * size + column] = cells[row];
  }

  return ok();
}

export function refreshField(game: TGame): TActionResult {
  shuffle(game.board);
  return ok();
}

// ------------------------------- Поимка и допрос -------------------------------

function catchSuspect(
  room: TRoom,
  game: TGame,
  player: TGamePlayer,
  cellIndex: number,
): TActionResult {
  const myIndex = getPlayerCellIndex(game, player);

  if (myIndex < 0) {
    return fail("Не удалось определить вашу позицию на поле");
  }

  if (!getAdjacentIndexes(game.size, myIndex).includes(cellIndex)) {
    return fail(
      "Поймать можно только соседнего подозреваемого — по горизонтали, вертикали или диагонали",
    );
  }

  const cell = game.board[cellIndex];

  if (cell === undefined) {
    return fail("Такой клетки нет");
  }

  if (cell.dead) {
    return fail("Этот подозреваемый уже погиб");
  }

  const suspect = getSuspect(cell.suspectId);
  const victim = room.users.find(
    (user) => user.id !== player.id && user.identityId === cell.suspectId,
  );

  if (victim === undefined) {
    addLog(
      game,
      "miss",
      `${player.name} спрашивает: «Кто-то из вас ${suspect.name}?» — никто не отозвался.`,
    );
    return ok();
  }

  // Поймали: карта подозреваемого переворачивается стороной «погиб»
  cell.dead = true;
  player.trophies.push(cell.suspectId);

  const newIdentity = drawIdentity(game);
  victim.identityId = newIdentity;

  addLog(
    game,
    "catch",
    `${player.name} поймал шпиона ${suspect.name}! Карта доказательства становится трофеем (${player.trophies.length}/${game.targetTrophies}). ${victim.name} получает новую тайную личность.`,
  );

  if (player.trophies.length >= game.targetTrophies) {
    finishGame(
      game,
      player.id,
      `${player.name} собирает ${player.trophies.length} трофея и побеждает!`,
    );
    return ok();
  }

  if (newIdentity === undefined) {
    finishByDeckEnd(room, game);
  }

  return ok();
}

function interrogate(
  room: TRoom,
  game: TGame,
  player: TGamePlayer,
  cellIndex: number,
): TActionResult {
  const myIndex = getPlayerCellIndex(game, player);

  if (myIndex < 0) {
    return fail("Не удалось определить вашу позицию на поле");
  }

  const isSelf = cellIndex === myIndex;

  if (!isSelf && !getAdjacentIndexes(game.size, myIndex).includes(cellIndex)) {
    return fail(
      "Допросить можно только соседнего подозреваемого (в том числе по диагонали) или самого себя",
    );
  }

  const cell = game.board[cellIndex];

  if (cell === undefined) {
    return fail("Такой клетки нет");
  }

  if (cell.dead) {
    return fail("Этот подозреваемый уже погиб — допрос невозможен");
  }

  const suspect = getSuspect(cell.suspectId);
  const nearTarget = getAdjacentIndexes(game.size, cellIndex);

  // Руку поднимают все, кто находится рядом с целью, и игрок, чья это личность
  const handRaisers = room.users.filter((user) => {
    if (user.identityId === cell.suspectId) return true;
    const userIndex = getPlayerCellIndex(game, user);
    return userIndex >= 0 && nearTarget.includes(userIndex);
  });

  game.lastInterrogation = {
    byPlayerId: player.id,
    cellIndex,
    suspectId: cell.suspectId,
    handRaiserIds: handRaisers.map((user) => user.id),
  };

  const names = handRaisers.map((user) => user.name).join(", ");
  addLog(
    game,
    "interrogate",
    `${player.name} допрашивает ${suspect.name}. Руку поднимают: ${names}.`,
  );

  return ok();
}

// ------------------------------- Ход игрока -------------------------------

export function performAction(
  room: TRoom,
  userId: string,
  action: TGameAction,
): TActionResult {
  const game = room.game;

  if (game === undefined) {
    return fail("Игра ещё не началась");
  }

  if (game.phase !== GamePhase.Playing) {
    return fail("Игра уже завершена");
  }

  const player = room.users.find((user) => user.id === userId);

  if (player === undefined) {
    return fail("Вы не участвуете в этой игре");
  }

  const currentPlayer = room.users[game.turnIndex];

  if (currentPlayer?.id !== player.id) {
    return fail("Сейчас не ваш ход");
  }

  let result: TActionResult;

  switch (action.type) {
    case "shift-row": {
      result = shiftRow(game, action.row, action.direction);
      if (result.ok) {
        game.lastInterrogation = undefined;
        addLog(
          game,
          "shift",
          `${player.name} сдвигает ряд ${action.row + 1} ${
            action.direction === 1 ? "вправо" : "влево"
          }.`,
        );
      }
      break;
    }
    case "shift-column": {
      result = shiftColumn(game, action.column, action.direction);
      if (result.ok) {
        game.lastInterrogation = undefined;
        addLog(
          game,
          "shift",
          `${player.name} сдвигает столбец ${action.column + 1} ${
            action.direction === 1 ? "вниз" : "вверх"
          }.`,
        );
      }
      break;
    }
    case "refresh": {
      result = refreshField(game);
      if (result.ok) {
        game.lastInterrogation = undefined;
        addLog(
          game,
          "refresh",
          `${player.name} обновляет поле: подозреваемые меняются местами.`,
        );
      }
      break;
    }
    case "catch": {
      result = catchSuspect(room, game, player, action.cellIndex);
      if (result.ok) game.lastInterrogation = undefined;
      break;
    }
    case "interrogate": {
      result = interrogate(room, game, player, action.cellIndex);
      break;
    }
    default: {
      result = fail("Неизвестное действие");
    }
  }

  if (result.ok && game.phase === GamePhase.Playing) {
    game.turnIndex = (game.turnIndex + 1) % room.users.length;
  }

  return result;
}

// ------------------------------- Выход игрока -------------------------------

export function removePlayer(room: TRoom, userId: string): void {
  const index = room.users.findIndex((user) => user.id === userId);

  if (index === -1) return;

  const [removed] = room.users.splice(index, 1);
  const game = room.game;
  const nextAdmin = removed.isAdmin ? room.users[0] : undefined;

  // Создатель комнаты ушёл — права переходят первому оставшемуся игроку,
  // иначе комнату больше нельзя ни начать, ни перезапустить.
  if (nextAdmin !== undefined) {
    nextAdmin.isAdmin = true;
  }

  if (game === undefined) return;

  addLog(game, "leave", `${removed.name} покидает игру.`);

  if (nextAdmin !== undefined) {
    addLog(game, "info", `${nextAdmin.name} теперь создатель комнаты.`);
  }

  if (game.phase !== GamePhase.Playing) return;

  if (removed.identityId) {
    game.deck.push(removed.identityId);
  }

  if (index < game.turnIndex) {
    game.turnIndex -= 1;
  }

  if (game.turnIndex >= room.users.length) {
    game.turnIndex = 0;
  }

  if (room.users.length < 2) {
    finishGame(game, undefined, "Игра прервана: в комнате осталось меньше двух игроков.");
  }
}

// ------------------------------- Персональное представление -------------------------------

export function getRoomView(room: TRoom, userId: string): TRoomView {
  const me = room.users.find((user) => user.id === userId);
  const game = room.game;

  const users: TPlayerView[] = room.users.map((user) => ({
    id: user.id,
    name: user.name,
    isAdmin: user.isAdmin,
    connected: user.connected,
    trophies: [...user.trophies],
  }));

  if (game === undefined) {
    return { roomCode: room.roomCode, users };
  }

  const currentPlayer = room.users[game.turnIndex];

  const gameView: TGameView = {
    phase: game.phase,
    size: game.size,
    board: game.board.map((cell) => ({ ...cell })),
    turnPlayerId: game.phase === GamePhase.Playing ? (currentPlayer?.id ?? "") : "",
    targetTrophies: game.targetTrophies,
    deckSize: game.deck.length,
    log: game.log.map((entry) => ({ ...entry })),
    lastInterrogation: game.lastInterrogation
      ? {
          ...game.lastInterrogation,
          handRaiserIds: [...game.lastInterrogation.handRaiserIds],
        }
      : undefined,
    winnerId: game.winnerId,
    myIdentityId: me?.identityId,
    myIndex: me ? getPlayerCellIndex(game, me) : -1,
  };

  return { roomCode: room.roomCode, users, game: gameView };
}



