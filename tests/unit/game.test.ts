import { describe, expect, it } from "vitest";
import {
  ALLOWED_PLAYER_COUNTS,
  createGame,
  getBoardSize,
  getRoomView,
  getStartBlockReason,
  getTargetTrophies,
  performAction,
  refreshField,
  removePlayer,
  resetGame,
  shiftColumn,
  shiftRow,
} from "../../server/game";
import { getAdjacentIndexes } from "../../utils/board";
import { GamePhase, TGame, TGamePlayer, TRoom } from "../../server/types";

function makeRoom(count: number): TRoom {
  const users: TGamePlayer[] = Array.from({ length: count }, (_, index) => ({
    id: `player-${index}`,
    name: `Игрок ${index + 1}`,
    isAdmin: index === 0 ? true : undefined,
    connected: true,
    trophies: [],
  }));

  return { roomCode: "test", users };
}

function createStartedRoom(count: number): TRoom {
  const room = makeRoom(count);
  const result = createGame(room);

  expect(result.ok).toBe(true);
  expect(room.game).toBeDefined();

  return room;
}

function getGame(room: TRoom): TGame {
  const game = room.game;

  if (game === undefined) throw new Error("Игра не создана");

  return game;
}

function setTurnTo(room: TRoom, player: TGamePlayer) {
  getGame(room).turnIndex = room.users.indexOf(player);
}

function currentPlayer(room: TRoom): TGamePlayer {
  return room.users[getGame(room).turnIndex];
}

/**
 * Раскладывает личности по первым клеткам поля:
 * игрок 0 — клетка 0, игрок 1 — клетка 1 и т.д.
 * Клетки 0 и 1 всегда соседние, поэтому игрок 0 может поймать игрока 1.
 */
function placePlayers(room: TRoom) {
  const game = getGame(room);

  room.users.forEach((user, index) => {
    user.identityId = game.board[index].suspectId;
    user.trophies = [];
  });

  const actor = room.users[0];
  const victim = room.users[1];

  setTurnTo(room, actor);

  return { actor, victim, actorCell: 0, victimCell: 1 };
}

describe("getBoardSize", () => {
  it.each([
    [3, 5],
    [4, 5],
    [5, 6],
    [6, 6],
    [8, 7],
    [9, 7],
  ])("для %i игроков поле %i×%i", (playerCount, size) => {
    expect(getBoardSize(playerCount)).toBe(size);
  });
});

describe("getTargetTrophies", () => {
  it.each([
    [3, 4],
    [5, 3],
    [8, 2],
    [9, 2],
  ])("для %i игроков нужно %i трофея", (playerCount, target) => {
    expect(getTargetTrophies(playerCount)).toBe(target);
  });
});

describe("getStartBlockReason", () => {
  it("не даёт стартовать вдвоём", () => {
    expect(getStartBlockReason(2)).toContain("минимум 3");
  });

  it("не поддерживает семерых игроков", () => {
    expect(getStartBlockReason(7)).toContain("7 игроков");
  });

  it("ограничивает состав девятью игроками", () => {
    expect(getStartBlockReason(10)).toContain("Максимум 9");
  });

  it.each(ALLOWED_PLAYER_COUNTS)("разрешает %i игроков", (playerCount) => {
    expect(getStartBlockReason(playerCount)).toBeUndefined();
  });
});

describe("getBoardSize", () => {
  it.each([
    [3, 5],
    [4, 5],
    [5, 6],
    [6, 6],
    [8, 7],
    [9, 7],
  ])("для %i игроков поле %i×%i", (playerCount, size) => {
    expect(getBoardSize(playerCount)).toBe(size);
  });
});

describe("getTargetTrophies", () => {
  it.each([
    [3, 4],
    [5, 3],
    [8, 2],
    [9, 2],
  ])("для %i игроков нужно %i трофея", (playerCount, target) => {
    expect(getTargetTrophies(playerCount)).toBe(target);
  });
});

describe("getStartBlockReason", () => {
  it("не даёт стартовать вдвоём", () => {
    expect(getStartBlockReason(2)).toContain("минимум 3");
  });

  it("не поддерживает семерых игроков", () => {
    expect(getStartBlockReason(7)).toContain("7 игроков");
  });

  it("ограничивает состав девятью игроками", () => {
    expect(getStartBlockReason(10)).toContain("Максимум 9");
  });

  it.each(ALLOWED_PLAYER_COUNTS)("разрешает %i игроков", (playerCount) => {
    expect(getStartBlockReason(playerCount)).toBeUndefined();
  });
});

describe("createGame", () => {
  it.each(ALLOWED_PLAYER_COUNTS)("создаёт партию на %i игроков", (playerCount) => {
    const room = createStartedRoom(playerCount);
    const game = getGame(room);
    const size = getBoardSize(playerCount);

    expect(game.phase).toBe(GamePhase.Playing);
    expect(game.size).toBe(size);
    expect(game.board).toHaveLength(size * size);
    expect(game.targetTrophies).toBe(getTargetTrophies(playerCount));
    expect(game.turnIndex).toBeGreaterThanOrEqual(0);
    expect(game.turnIndex).toBeLessThan(playerCount);
    expect(game.log.at(-1)?.text).toContain(room.users[game.turnIndex].name);

    const boardSuspectIds = game.board.map((cell) => cell.suspectId);

    expect(new Set(boardSuspectIds).size).toBe(boardSuspectIds.length);
    expect(game.board.every((cell) => cell.dead === false)).toBe(true);

    const identities = room.users.map((user) => user.identityId);

    identities.forEach((identityId) => {
      expect(identityId).toBeDefined();
      expect(boardSuspectIds).toContain(identityId);
      expect(game.deck).not.toContain(identityId);
    });

    expect(new Set(identities).size).toBe(playerCount);
    expect(game.deck).toHaveLength(size * size - playerCount);
  });

  it("не перемешивает список игроков, выбирая первого ходящего", () => {
    const room = makeRoom(4);
    const order = room.users.map((user) => user.id);

    createGame(room);

    expect(room.users.map((user) => user.id)).toEqual(order);
    expect(room.users[0].isAdmin).toBe(true);
  });

  it("не начинает игру при недопустимом составе", () => {
    [2, 7, 10].forEach((playerCount) => {
      const room = makeRoom(playerCount);
      const result = createGame(room);

      expect(result.ok).toBe(false);
      expect(room.game).toBeUndefined();
      expect(room.users.every((user) => user.identityId === undefined)).toBe(true);
    });
  });

  it("сбрасывает прежние трофеи и личности", () => {
    const room = makeRoom(3);

    room.users.forEach((user) => {
      user.trophies = ["old-trophy"];
      user.identityId = "old-identity";
    });

    expect(createGame(room).ok).toBe(true);
    expect(room.users.every((user) => user.trophies.length === 0)).toBe(true);
    expect(room.users.every((user) => user.identityId !== "old-identity")).toBe(true);
  });
});

describe("shiftRow", () => {
  it("сдвигает ряд вправо по кругу", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);
    const row = 1;
    const start = row * game.size;
    const firstRow = game.board.slice(0, game.size).map((cell) => cell.suspectId);
    const beforeRow = game.board
      .slice(start, start + game.size)
      .map((cell) => cell.suspectId);

    expect(shiftRow(game, row, 1).ok).toBe(true);

    const afterRow = game.board
      .slice(start, start + game.size)
      .map((cell) => cell.suspectId);

    expect(afterRow[0]).toBe(beforeRow[game.size - 1]);
    expect(afterRow.slice(1)).toEqual(beforeRow.slice(0, -1));
    expect(game.board.slice(0, game.size).map((cell) => cell.suspectId)).toEqual(
      firstRow,
    );

    expect(shiftRow(game, row, -1).ok).toBe(true);
    expect(
      game.board.slice(start, start + game.size).map((cell) => cell.suspectId),
    ).toEqual(beforeRow);
  });

  it("отклоняет несуществующий ряд", () => {
    const game = getGame(createStartedRoom(3));

    expect(shiftRow(game, -1, 1).ok).toBe(false);
    expect(shiftRow(game, game.size, 1).ok).toBe(false);
    expect(shiftRow(game, 1.5, 1).ok).toBe(false);
  });
});

describe("shiftColumn", () => {
  it("сдвигает столбец вниз по кругу", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);
    const column = 2;
    const readColumn = () =>
      Array.from(
        { length: game.size },
        (_, row) => game.board[row * game.size + column].suspectId,
      );
    const before = readColumn();

    expect(shiftColumn(game, column, 1).ok).toBe(true);

    const after = readColumn();

    expect(after[1]).toBe(before[0]);
    expect(after[0]).toBe(before[game.size - 1]);

    expect(shiftColumn(game, column, -1).ok).toBe(true);
    expect(readColumn()).toEqual(before);
  });

  it("отклоняет несуществующий столбец", () => {
    const game = getGame(createStartedRoom(5));

    expect(shiftColumn(game, -1, 1).ok).toBe(false);
    expect(shiftColumn(game, game.size, -1).ok).toBe(false);
  });
});

describe("refreshField", () => {
  it("перемешивает поле, сохраняя набор подозреваемых", () => {
    const game = getGame(createStartedRoom(5));
    const before = game.board.map((cell) => cell.suspectId).sort();

    expect(refreshField(game).ok).toBe(true);

    expect(game.board.map((cell) => cell.suspectId).sort()).toEqual(before);
    expect(game.board).toHaveLength(before.length);
  });
});
describe("performAction", () => {
  it("не принимает действие до старта игры", () => {
    const room = makeRoom(3);
    const result = performAction(room, room.users[0].id, { type: "refresh" });

    expect(result.ok).toBe(false);
  });

  it("не принимает действие от неизвестного игрока", () => {
    const room = createStartedRoom(3);
    const result = performAction(room, "unknown-player", { type: "refresh" });

    expect(result.ok).toBe(false);
  });

  it("не даёт ходить не в свой ход", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);
    const notCurrent = room.users[(game.turnIndex + 1) % room.users.length];
    const result = performAction(room, notCurrent.id, { type: "refresh" });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain("не ваш ход");
  });

  it("не принимает действия после завершения игры", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);

    game.phase = GamePhase.Finished;

    const result = performAction(room, currentPlayer(room).id, {
      type: "refresh",
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain("завершена");
  });

  it("после сдвига ряда передаёт ход следующему игроку", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);
    const actor = currentPlayer(room);
    const nextPlayer = room.users[(game.turnIndex + 1) % room.users.length];

    const result = performAction(room, actor.id, {
      type: "shift-row",
      row: 0,
      direction: 1,
    });

    expect(result.ok).toBe(true);
    expect(currentPlayer(room)).toBe(nextPlayer);
    expect(game.log.at(-1)?.text).toContain("сдвигает ряд 1 вправо");
  });

  it("после сдвига столбца передаёт ход следующему игроку", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);
    const actor = currentPlayer(room);

    const result = performAction(room, actor.id, {
      type: "shift-column",
      column: 1,
      direction: -1,
    });

    expect(result.ok).toBe(true);
    expect(game.log.at(-1)?.text).toContain("сдвигает столбец 2 вверх");
  });

  it("обновление поля сбрасывает результат допроса", () => {
    const room = createStartedRoom(3);
    const { actor, victimCell } = placePlayers(room);
    const game = getGame(room);

    expect(
      performAction(room, actor.id, { type: "interrogate", cellIndex: victimCell }).ok,
    ).toBe(true);
    expect(game.lastInterrogation).toBeDefined();

    setTurnTo(room, actor);
    expect(performAction(room, actor.id, { type: "refresh" }).ok).toBe(true);

    expect(game.lastInterrogation).toBeUndefined();
    expect(game.log.at(-1)?.text).toContain("обновляет поле");
  });
});

describe("поимка шпиона", () => {
  it("переворачивает карту, выдаёт трофей и новую личность жертве", () => {
    const room = createStartedRoom(4);
    const { actor, victim, actorCell, victimCell } = placePlayers(room);
    const game = getGame(room);
    const oldVictimIdentity = victim.identityId;

    expect(getAdjacentIndexes(game.size, actorCell)).toContain(victimCell);

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: victimCell,
    });

    expect(result.ok).toBe(true);
    expect(game.board[victimCell].dead).toBe(true);
    expect(actor.trophies).toEqual([game.board[victimCell].suspectId]);
    expect(victim.identityId).not.toBe(oldVictimIdentity);
    expect(game.log.at(-1)?.kind).toBe("catch");
  });

  it("разрешает поймать соперника по диагонали", () => {
    const room = createStartedRoom(4);
    const { actor, victim } = placePlayers(room);
    const game = getGame(room);
    const diagonalCell = game.size + 1; // клетка (ряд 2, место 2) при актёре в (ряд 1, место 1)

    victim.identityId = game.board[diagonalCell].suspectId;

    expect(getAdjacentIndexes(game.size, 0)).toContain(diagonalCell);

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: diagonalCell,
    });

    expect(result.ok).toBe(true);
    expect(game.board[diagonalCell].dead).toBe(true);
    expect(actor.trophies).toEqual([game.board[diagonalCell].suspectId]);
  });

  it("не даёт ловить не соседнюю клетку", () => {
    const room = createStartedRoom(4);
    const { actor } = placePlayers(room);
    const game = getGame(room);

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: game.board.length - 1,
    });

    expect(result.ok).toBe(false);
    expect(actor.trophies).toHaveLength(0);
    expect(currentPlayer(room)).toBe(actor);
  });

  it("не даёт ловить уже погибшего подозреваемого", () => {
    const room = createStartedRoom(4);
    const { actor } = placePlayers(room);
    const game = getGame(room);

    game.board[5].dead = true;

    expect(
      performAction(room, actor.id, { type: "catch", cellIndex: 5 }).ok,
    ).toBe(false);
  });

  it("сообщает о промахе и передаёт ход, если личности нет на клетке", () => {
    const room = createStartedRoom(4);
    const { actor } = placePlayers(room);
    const game = getGame(room);

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: 5,
    });

    expect(result.ok).toBe(true);
    expect(actor.trophies).toHaveLength(0);
    expect(game.board[5].dead).toBe(false);
    expect(game.log.at(-1)?.kind).toBe("miss");
    expect(currentPlayer(room)).not.toBe(actor);
  });

  it("завершает игру при достижении цели по трофеям", () => {
    const room = createStartedRoom(4);
    const { actor, victimCell } = placePlayers(room);
    const game = getGame(room);

    actor.trophies = ["fake-1", "fake-2"];

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: victimCell,
    });

    expect(result.ok).toBe(true);
    expect(actor.trophies).toHaveLength(3);
    expect(actor.trophies.length).toBe(game.targetTrophies);
    expect(game.phase).toBe(GamePhase.Finished);
    expect(game.winnerId).toBe(actor.id);
    expect(game.lastInterrogation).toBeUndefined();
  });

  it("не выдаёт жертве карту уже пойманного подозреваемого", () => {
    const room = createStartedRoom(3);
    const { actor, victim, victimCell } = placePlayers(room);
    const game = getGame(room);

    const caughtSuspectId = game.board[victimCell].suspectId;
    const aliveCell = game.board[5];

    game.deck = [caughtSuspectId, aliveCell.suspectId];

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: victimCell,
    });

    expect(result.ok).toBe(true);
    expect(victim.identityId).toBe(aliveCell.suspectId);
    expect(game.deck).toHaveLength(0);
  });

  it("не считает колоду непустой, если в ней остались только погибшие карты", () => {
    const room = createStartedRoom(3);
    const { actor, victimCell } = placePlayers(room);
    const game = getGame(room);

    game.deck = [game.board[victimCell].suspectId];

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: victimCell,
    });

    expect(result.ok).toBe(true);
    expect(game.phase).toBe(GamePhase.Finished);
    expect(game.log.at(-1)?.text).toContain("Колода доказательств закончилась");
  });

  it("завершает игру, когда колода доказательств закончилась", () => {
    const room = createStartedRoom(3);
    const { actor, victimCell } = placePlayers(room);
    const game = getGame(room);

    game.deck = [];

    const result = performAction(room, actor.id, {
      type: "catch",
      cellIndex: victimCell,
    });

    expect(result.ok).toBe(true);
    expect(game.phase).toBe(GamePhase.Finished);
    expect(game.winnerId).toBe(actor.id);
    expect(game.log.at(-1)?.text).toContain("Колода доказательств закончилась");
  });
});

describe("допрос", () => {
  it("поднимает руку владелец личности и соседи цели", () => {
    const room = createStartedRoom(3);
    const { actor, victim, victimCell } = placePlayers(room);
    const game = getGame(room);

    const result = performAction(room, actor.id, {
      type: "interrogate",
      cellIndex: victimCell,
    });

    expect(result.ok).toBe(true);
    expect(game.lastInterrogation).toEqual({
      byPlayerId: actor.id,
      cellIndex: victimCell,
      suspectId: game.board[victimCell].suspectId,
      handRaiserIds: expect.arrayContaining([actor.id, victim.id]),
    });
    expect(game.log.at(-1)?.kind).toBe("interrogate");
    expect(currentPlayer(room)).not.toBe(actor);
  });

  it("не поднимает руку игрок вдали от цели", () => {
    const room = createStartedRoom(3);
    const { actor, victim, victimCell } = placePlayers(room);
    const game = getGame(room);
    const distantPlayer = room.users[2];

    // Уводим третьего игрока в дальний угол поля
    distantPlayer.identityId = game.board[game.board.length - 1].suspectId;

    expect(
      performAction(room, actor.id, { type: "interrogate", cellIndex: victimCell }).ok,
    ).toBe(true);

    const handRaiserIds = game.lastInterrogation?.handRaiserIds ?? [];

    expect(handRaiserIds).toContain(actor.id);
    expect(handRaiserIds).toContain(victim.id);
    expect(handRaiserIds).not.toContain(distantPlayer.id);
  });

  it("разрешает допросить самого себя", () => {
    const room = createStartedRoom(3);
    const { actor, actorCell } = placePlayers(room);
    const game = getGame(room);

    const result = performAction(room, actor.id, {
      type: "interrogate",
      cellIndex: actorCell,
    });

    expect(result.ok).toBe(true);
    expect(game.lastInterrogation?.suspectId).toBe(
      game.board[actorCell].suspectId,
    );
  });

  it("разрешает допросить подозреваемого по диагонали", () => {
    const room = createStartedRoom(3);
    const { actor } = placePlayers(room);
    const game = getGame(room);
    const diagonalCell = game.size + 1;

    expect(getAdjacentIndexes(game.size, 0)).toContain(diagonalCell);

    const result = performAction(room, actor.id, {
      type: "interrogate",
      cellIndex: diagonalCell,
    });

    expect(result.ok).toBe(true);
    expect(game.lastInterrogation?.cellIndex).toBe(diagonalCell);
  });

  it("не даёт допрашивать далёкую клетку", () => {
    const room = createStartedRoom(3);
    const { actor } = placePlayers(room);
    const game = getGame(room);

    const result = performAction(room, actor.id, {
      type: "interrogate",
      cellIndex: game.board.length - 1,
    });

    expect(result.ok).toBe(false);
    expect(game.lastInterrogation).toBeUndefined();
  });

  it("не даёт допрашивать погибшего подозреваемого", () => {
    const room = createStartedRoom(3);
    const { actor, victimCell } = placePlayers(room);
    const game = getGame(room);

    game.board[victimCell].dead = true;

    expect(
      performAction(room, actor.id, {
        type: "interrogate",
        cellIndex: victimCell,
      }).ok,
    ).toBe(false);
  });
});

describe("removePlayer", () => {
  it("возвращает личность в колоду и сдвигает указатель хода", () => {
    const room = createStartedRoom(4);
    const game = getGame(room);
    const removed = room.users[1];
    const removedIdentity = removed.identityId;

    game.turnIndex = 2;

    removePlayer(room, removed.id);

    expect(room.users).toHaveLength(3);
    expect(room.users.some((user) => user.id === removed.id)).toBe(false);
    expect(game.turnIndex).toBe(1);
    expect(game.deck).toContain(removedIdentity);
    expect(game.log.at(-1)?.kind).toBe("leave");
  });

  it("прерывает игру, когда осталось меньше двух игроков", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);

    removePlayer(room, room.users[2].id);
    expect(game.phase).toBe(GamePhase.Playing);

    removePlayer(room, room.users[1].id);

    expect(room.users).toHaveLength(1);
    expect(game.phase).toBe(GamePhase.Finished);
    expect(game.winnerId).toBeUndefined();
    expect(game.log.at(-1)?.text).toContain("Игра прервана");
  });

  it("игнорирует неизвестный id", () => {
    const room = createStartedRoom(3);
    const game = getGame(room);

    removePlayer(room, "unknown-player");

    expect(room.users).toHaveLength(3);
    expect(game.phase).toBe(GamePhase.Playing);
  });

  it("удаляет игрока из лобби", () => {
    const room = makeRoom(3);
    const removed = room.users[1];

    removePlayer(room, removed.id);

    expect(room.users).toHaveLength(2);
    expect(room.game).toBeUndefined();
  });
});

describe("resetGame", () => {
  it("удаляет игру, трофеи и тайные личности", () => {
    const room = createStartedRoom(4);

    room.users.forEach((user, index) => {
      user.trophies = [`trophy-${index}`];
    });

    resetGame(room);

    expect(room.game).toBeUndefined();

    room.users.forEach((user) => {
      expect(user.trophies).toEqual([]);
      expect(user.identityId).toBeUndefined();
    });
  });
});

describe("передача прав создателя комнаты", () => {
  it("передаёт права первому оставшемуся игроку", () => {
    const room = createStartedRoom(4);
    const admin = room.users.find((user) => user.isAdmin);
    const game = getGame(room);

    expect(admin).toBeDefined();

    removePlayer(room, admin!.id);

    expect(room.users).toHaveLength(3);
    expect(room.users.filter((user) => user.isAdmin)).toHaveLength(1);
    expect(room.users[0].isAdmin).toBe(true);
    expect(game.log.at(-1)?.text).toBe(
      `${room.users[0].name} теперь создатель комнаты.`,
    );
  });

  it("не меняет создателя, если уходит обычный игрок", () => {
    const room = createStartedRoom(4);
    const admin = room.users.find((user) => user.isAdmin);
    const regular = room.users.find((user) => !user.isAdmin);

    removePlayer(room, regular!.id);

    expect(room.users.find((user) => user.isAdmin)?.id).toBe(admin!.id);
    expect(room.users.filter((user) => user.isAdmin)).toHaveLength(1);
  });

  it("не падает, когда уходит последний игрок", () => {
    const room = makeRoom(1);

    removePlayer(room, room.users[0].id);

    expect(room.users).toHaveLength(0);
  });

  it("передаёт права и в завершённой партии", () => {
    const room = createStartedRoom(3);
    const admin = room.users.find((user) => user.isAdmin);

    getGame(room).phase = GamePhase.Finished;

    removePlayer(room, admin!.id);

    expect(room.users.filter((user) => user.isAdmin)).toHaveLength(1);
  });
});

describe("getRoomView", () => {
  it("до старта игры отдаёт только список игроков", () => {
    const room = makeRoom(3);
    const view = getRoomView(room, room.users[0].id);

    expect(view.roomCode).toBe("test");
    expect(view.game).toBeUndefined();
    expect(view.users).toHaveLength(3);
    expect(view.users.every((user) => !("identityId" in user))).toBe(true);
  });

  it("не раскрывает чужие тайные личности", () => {
    const room = createStartedRoom(3);
    const me = room.users[0];
    const game = getGame(room);
    const view = getRoomView(room, me.id);
    const gameView = view.game;

    expect(JSON.stringify(view)).not.toContain("identityId");
    expect(gameView?.myIdentityId).toBe(me.identityId);
    expect(gameView?.myIndex).toBe(
      game.board.findIndex((cell) => cell.suspectId === me.identityId),
    );
    expect(gameView?.turnPlayerId).toBe(currentPlayer(room).id);
    expect(gameView?.deckSize).toBe(game.deck.length);
  });

  it("отдаёт копии поля и трофеев", () => {
    const room = createStartedRoom(3);
    const view = getRoomView(room, room.users[0].id);
    const game = getGame(room);
    const boardSuspectId = game.board[0].suspectId;

    view.game!.board[0].suspectId = "hacked";
    view.users[0].trophies.push("fake-trophy");

    expect(game.board[0].suspectId).toBe(boardSuspectId);
    expect(room.users[0].trophies).toHaveLength(0);
    expect(view.users[0].id).toBe(room.users[0].id);
  });

  it("сообщает позицию своей личности и итог игры", () => {
    const room = createStartedRoom(3);
    const { actor, victimCell } = placePlayers(room);
    const game = getGame(room);

    actor.trophies = ["fake-1", "fake-2", "fake-3"];
    game.targetTrophies = 4;

    expect(
      performAction(room, actor.id, { type: "catch", cellIndex: victimCell }).ok,
    ).toBe(true);
    expect(game.phase).toBe(GamePhase.Finished);

    const view = getRoomView(room, actor.id);

    expect(view.game?.winnerId).toBe(actor.id);
    expect(view.game?.turnPlayerId).toBe("");
    expect(view.game?.myIndex).toBe(0);
  });
});

