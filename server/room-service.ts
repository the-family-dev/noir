import { generateCode } from "@/utils/code-generator";
import {
  isValidBoardShift,
  shiftBoardCharacters,
} from "@/utils/board-shift";
import {
  advanceTurnToNext,
  buildPlayingGameState,
  createInitialNoirGameState,
  ensureValidCurrentTurn,
  MIN_PLAYERS_TO_START,
  syncPreparationBoardSize,
} from "@/utils/noir-game";
import {
  BoardShift,
  GamePhase,
  RoomErrorCode,
  RoomFail,
  RoomResult,
  TRoom,
  TUser,
} from "./types";

type MemberIdentity = {
  name: string;
  sessionId: string;
  socketId: string;
};

type JoinParams = MemberIdentity & {
  roomCode: string;
};

type ReconnectParams = {
  roomCode: string;
  sessionId: string;
  socketId: string;
};

type KickParams = {
  roomCode: string;
  adminSocketId: string;
  targetSessionId: string;
};

type StartGameParams = {
  roomCode: string;
  adminSocketId: string;
};

type EndTurnParams = {
  roomCode: string;
  socketId: string;
};

type ShiftBoardParams = {
  roomCode: string;
  socketId: string;
  shift: BoardShift;
};

class RoomService {
  private rooms = new Map<string, TRoom>();

  create(params: MemberIdentity): RoomResult<{ room: TRoom; member: TUser }> {
    const name = params.name.trim();
    const member: TUser = {
      socketId: params.socketId,
      sessionId: params.sessionId,
      name,
      isAdmin: true,
    };

    const room: TRoom = {
      roomCode: this.ensureUniqueCode(),
      members: [member],
      game: createInitialNoirGameState(1),
    };

    this.rooms.set(room.roomCode, room);
    return { ok: true, room, member };
  }

  join(
    params: JoinParams,
  ): RoomResult<{ room: TRoom; member: TUser; reconnected: boolean }> {
    const room = this.rooms.get(params.roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${params.roomCode} не найдена`,
      );
    }

    const bySession = this.findMemberBySessionId(room, params.sessionId);
    if (bySession) {
      this.applyReconnect(bySession, params.socketId);
      return { ok: true, room, member: bySession, reconnected: true };
    }

    if (room.game.phase !== GamePhase.Preparation) {
      return this.fail(
        RoomErrorCode.GameAlreadyStarted,
        "Игра уже началась, присоединиться нельзя",
      );
    }

    const name = params.name.trim();

    if (this.findMemberByName(room, name)) {
      return this.fail(
        RoomErrorCode.NameTaken,
        `Пользователь с именем ${name} уже существует`,
      );
    }

    const member: TUser = {
      socketId: params.socketId,
      sessionId: params.sessionId,
      name,
    };

    room.members.push(member);
    this.refreshPreparationBoard(room);
    return { ok: true, room, member, reconnected: false };
  }

  reconnect(
    params: ReconnectParams,
  ): RoomResult<{ room: TRoom; member: TUser }> {
    const room = this.rooms.get(params.roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${params.roomCode} не найдена`,
      );
    }

    const member = this.findMemberBySessionId(room, params.sessionId);
    if (member === undefined) {
      return this.fail(
        RoomErrorCode.SessionNotFound,
        "Сессия не найдена в этой комнате",
      );
    }

    this.applyReconnect(member, params.socketId);
    return { ok: true, room, member };
  }

  leave(
    roomCode: string,
    socketId: string,
  ): RoomResult<{ room: TRoom | undefined; removed: TUser }> {
    const room = this.rooms.get(roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${roomCode} не найдена`,
      );
    }

    const removed = this.removeMember(room, (m) => m.socketId === socketId);
    if (removed === undefined) {
      return this.fail(
        RoomErrorCode.MemberNotFound,
        "Участник не найден в комнате",
      );
    }

    this.transferAdminIfNeeded(room);
    this.refreshPreparationBoard(room);
    this.fixTurnAfterMemberChange(room, removed.sessionId);
    const remaining = this.deleteRoomIfEmpty(room.roomCode);
    return { ok: true, room: remaining, removed };
  }

  kick(
    params: KickParams,
  ): RoomResult<{ room: TRoom | undefined; removed: TUser }> {
    const room = this.rooms.get(params.roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${params.roomCode} не найдена`,
      );
    }

    if (!this.isAdminSocket(room, params.adminSocketId)) {
      return this.fail(
        RoomErrorCode.NotAdmin,
        "Только администратор может исключить участника",
      );
    }

    const removed = this.removeMember(
      room,
      (m) => m.sessionId === params.targetSessionId,
    );
    if (removed === undefined) {
      return this.fail(
        RoomErrorCode.MemberNotFound,
        "Участник не найден в комнате",
      );
    }

    this.transferAdminIfNeeded(room);
    this.refreshPreparationBoard(room);
    this.fixTurnAfterMemberChange(room, removed.sessionId);
    const remaining = this.deleteRoomIfEmpty(room.roomCode);
    return { ok: true, room: remaining, removed };
  }

  startGame(params: StartGameParams): RoomResult<{ room: TRoom }> {
    const room = this.rooms.get(params.roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${params.roomCode} не найдена`,
      );
    }

    if (!this.isAdminSocket(room, params.adminSocketId)) {
      return this.fail(
        RoomErrorCode.NotAdmin,
        "Только администратор может начать игру",
      );
    }

    if (room.game.phase !== GamePhase.Preparation) {
      return this.fail(
        RoomErrorCode.InvalidPhase,
        "Игру можно начать только на этапе подготовки",
      );
    }

    if (room.members.length < MIN_PLAYERS_TO_START) {
      return this.fail(
        RoomErrorCode.NotEnoughPlayers,
        `Нужно минимум ${MIN_PLAYERS_TO_START} игрока`,
      );
    }

    const boardSize = room.game.boardSize;
    const cellCount = boardSize * boardSize;
    if (room.members.length > cellCount) {
      return this.fail(
        RoomErrorCode.NotEnoughPlayers,
        "Игроков больше, чем карточек на поле",
      );
    }

    room.game = buildPlayingGameState(boardSize, room.members);
    return { ok: true, room };
  }

  endTurn(params: EndTurnParams): RoomResult<{ room: TRoom }> {
    const room = this.rooms.get(params.roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${params.roomCode} не найдена`,
      );
    }

    if (room.game.phase !== GamePhase.Playing) {
      return this.fail(
        RoomErrorCode.InvalidPhase,
        "Завершить ход можно только во время игры",
      );
    }

    const member = room.members.find((m) => m.socketId === params.socketId);
    if (member === undefined) {
      return this.fail(
        RoomErrorCode.MemberNotFound,
        "Участник не найден в комнате",
      );
    }

    if (room.game.currentTurnSessionId !== member.sessionId) {
      return this.fail(
        RoomErrorCode.NotYourTurn,
        "Сейчас не ваш ход",
      );
    }

    room.game = advanceTurnToNext(room.game, room.members);
    return { ok: true, room };
  }

  shiftBoard(params: ShiftBoardParams): RoomResult<{ room: TRoom }> {
    const room = this.rooms.get(params.roomCode);
    if (room === undefined) {
      return this.fail(
        RoomErrorCode.RoomNotFound,
        `Комната ${params.roomCode} не найдена`,
      );
    }

    if (room.game.phase !== GamePhase.Playing) {
      return this.fail(
        RoomErrorCode.InvalidPhase,
        "Сдвигать поле можно только во время игры",
      );
    }

    const member = room.members.find((m) => m.socketId === params.socketId);
    if (member === undefined) {
      return this.fail(
        RoomErrorCode.MemberNotFound,
        "Участник не найден в комнате",
      );
    }

    if (room.game.currentTurnSessionId !== member.sessionId) {
      return this.fail(RoomErrorCode.NotYourTurn, "Сейчас не ваш ход");
    }

    if (room.game.boardShiftUsedThisTurn) {
      return this.fail(
        RoomErrorCode.ActionAlreadyUsed,
        "Сдвиг поля уже использован в этом ходу",
      );
    }

    if (!isValidBoardShift(room.game.boardSize, params.shift)) {
      return this.fail(RoomErrorCode.InvalidMove, "Некорректный сдвиг поля");
    }

    const seq = (room.game.lastBoardShift?.seq ?? 0) + 1;
    const shift = { ...params.shift, seq };

    room.game = {
      ...room.game,
      board: shiftBoardCharacters(
        room.game.board,
        room.game.boardSize,
        params.shift,
      ),
      boardShiftUsedThisTurn: true,
      lastBoardShift: shift,
    };

    return { ok: true, room };
  }

  disconnect(socketId: string): { room: TRoom; member: TUser } | undefined {
    const found = this.findMemberBySocketId(socketId);
    if (found === undefined) return undefined;

    found.member.disconnected = true;
    return found;
  }

  getRoom(roomCode: string): TRoom | undefined {
    return this.rooms.get(roomCode);
  }

  private ensureUniqueCode(): string {
    let code = generateCode(8);
    while (this.rooms.has(code)) {
      code = generateCode(8);
    }
    return code;
  }

  private applyReconnect(member: TUser, socketId: string) {
    member.socketId = socketId;
    member.disconnected = false;
  }

  private isAdminSocket(room: TRoom, socketId: string): boolean {
    return room.members.some(
      (user) => user.socketId === socketId && user.isAdmin === true,
    );
  }

  private transferAdminIfNeeded(room: TRoom) {
    if (room.members.length === 0) return;
    if (room.members.some((m) => m.isAdmin === true)) return;

    const nextAdmin =
      room.members.find((m) => !m.disconnected) ?? room.members[0];
    nextAdmin.isAdmin = true;
  }

  private findMemberBySocketId(socketId: string): {
    room: TRoom;
    member: TUser;
  } | undefined {
    for (const room of this.rooms.values()) {
      const member = room.members.find((m) => m.socketId === socketId);
      if (member) {
        return { room, member };
      }
    }
    return undefined;
  }

  private findMemberBySessionId(
    room: TRoom,
    sessionId: string,
  ): TUser | undefined {
    return room.members.find((m) => m.sessionId === sessionId);
  }

  private findMemberByName(room: TRoom, name: string): TUser | undefined {
    const normalized = name.trim().toLowerCase();
    return room.members.find(
      (m) => m.name.trim().toLowerCase() === normalized,
    );
  }

  private removeMember(
    room: TRoom,
    predicate: (m: TUser) => boolean,
  ): TUser | undefined {
    const index = room.members.findIndex(predicate);
    if (index === -1) return undefined;

    const [removed] = room.members.splice(index, 1);
    return removed;
  }

  private deleteRoomIfEmpty(roomCode: string): TRoom | undefined {
    const room = this.rooms.get(roomCode);
    if (room === undefined) return undefined;

    if (room.members.length === 0) {
      this.rooms.delete(roomCode);
      return undefined;
    }

    return room;
  }

  private refreshPreparationBoard(room: TRoom) {
    room.game = syncPreparationBoardSize(room.game, room.members.length);
  }

  private fixTurnAfterMemberChange(room: TRoom, removedSessionId: string) {
    room.game = ensureValidCurrentTurn(
      room.game,
      room.members,
      removedSessionId,
    );
  }

  private fail(code: RoomErrorCode, message: string): RoomFail {
    return { ok: false, code, message };
  }
}

export const roomService = new RoomService();
