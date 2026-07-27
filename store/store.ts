"use client";
import { makeAutoObservable } from "mobx";
import {
  SocketEvents,
  TMessage,
  TRoom,
  TUser,
  BoardShift,
  BoardCharacter,
} from "@/server/types";
import { socket } from "@/lib/socket";
import { TypedStorage } from "@/utils/storage";
import {
  activeRoomCodeStorageKey,
  nameStorageKey,
  sessionIdStorageKey,
} from "@/utils/constants";
import {
  boardsEqual,
  detectBoardShift,
  shiftBoardCharacters,
} from "@/utils/board-shift";
import { usePathname, useRouter } from "next/navigation";

export enum LoginType {
  Join = "join",
  Create = "create",
}

type TLoginForm = {
  roomCode: string;
  type: LoginType;
};

type TChat = {
  inputMessage: string;
  messages: TMessage[];
};

/** Активная анимация сдвига поля */
export type BoardShiftAnimation = {
  seq: number;
  shift: BoardShift;
  boardBefore: BoardCharacter[];
  boardAfter: BoardCharacter[];
  boardSize: number;
};

/** Локальный seq до ответа сервера */
export const LOCAL_BOARD_SHIFT_SEQ = -1;

function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class Store {
  loginForm: TLoginForm = this._getLoginFormDefaultState();
  chat: TChat = {
    inputMessage: "",
    messages: [],
  };

  private _nameStorage = new TypedStorage<string | undefined>(
    nameStorageKey,
    undefined,
  );

  private _sessionIdStorage = new TypedStorage<string | undefined>(
    sessionIdStorageKey,
    undefined,
  );

  private _activeRoomCodeStorage = new TypedStorage<string | undefined>(
    activeRoomCodeStorageKey,
    undefined,
  );

  userName: string | undefined = undefined;
  sessionId: string | undefined = undefined;
  room: TRoom | undefined = undefined;
  fromPath: string | undefined = undefined;
  /** Блокирует авто-вход после выхода/кика, пока пользователь сам не зайдёт снова */
  suppressAutoJoin = false;
  /** true, пока ждём ответ сокета на создание/вход в комнату */
  isEnteringRoom = false;
  /** Текущая анимация сдвига (общая для всех клиентов) */
  boardShiftAnim: BoardShiftAnimation | null = null;

  private lastPlayedShiftSeq = 0;

  router: ReturnType<typeof useRouter> | undefined = undefined;
  pathname: ReturnType<typeof usePathname> | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  get isAdmin() {
    if (this.room === undefined || this.sessionId === undefined) return false;
    return this.room.members.some(
      (user) => user.sessionId === this.sessionId && user.isAdmin === true,
    );
  }

  get me(): TUser | undefined {
    if (this.room === undefined || this.sessionId === undefined) return undefined;
    return this.room.members.find((m) => m.sessionId === this.sessionId);
  }

  get isMyTurn(): boolean {
    if (this.room === undefined || this.sessionId === undefined) return false;
    return this.room.game.currentTurnSessionId === this.sessionId;
  }

  get currentTurnPlayer(): TUser | undefined {
    if (this.room === undefined) return undefined;
    const turnId = this.room.game.currentTurnSessionId;
    if (turnId === null) return undefined;
    return this.room.members.find((m) => m.sessionId === turnId);
  }

  public ensureSessionId() {
    let sessionId = this._sessionIdStorage.get();
    if (sessionId === undefined) {
      sessionId = createSessionId();
      this._sessionIdStorage.set(sessionId);
    }
    this.sessionId = sessionId;
    return sessionId;
  }

  public requestStoredName() {
    this.ensureSessionId();

    const name = this._nameStorage.get()?.trim();

    if (!name) {
      this.userName = undefined;
      this.fromPath = this.pathname;
      this.router?.push("/register");
      return;
    }

    this.userName = name;
  }

  public register() {
    const name = this.userName?.trim();
    if (!name) return;

    this.userName = name;
    this._nameStorage.set(name);

    const toPath = this.fromPath ? this.fromPath : "/";

    if (this.fromPath) {
      this.joinRoomByLink(this.fromPath.split("/").at(-1));
    }

    this.router?.push(toPath);
    this.fromPath = undefined;
  }

  public setName(name: string) {
    this.userName = name;
  }

  public setLoginFormField<K extends keyof TLoginForm>(
    field: K,
    value: TLoginForm[K],
  ) {
    this.loginForm[field] = value;
  }

  public setChatMessage(message: string) {
    this.chat.inputMessage = message;
  }

  public sendMessage() {
    if (this.room === undefined) return;
    if (this.userName === undefined) return;
    if (this.chat.inputMessage.trim() === "") return;

    socket.emit(SocketEvents.SendMessage, {
      roomCode: this.room.roomCode,
      message: {
        content: this.chat.inputMessage,
        sender: this.userName,
      },
    });

    this.chat.inputMessage = "";
  }

  public receiveMessage(message: TMessage) {
    this.chat.messages.push(message);
  }

  public setRoom(room: TRoom) {
    const previousBoard = this.room?.game.board;

    this.room = room;
    this.isEnteringRoom = false;
    this._activeRoomCodeStorage.set(room.roomCode);

    // RoomUpdated обновляет состояние; анимацию запускаем отдельно
    if (
      previousBoard &&
      previousBoard.length > 0 &&
      room.game.board.length > 0 &&
      !boardsEqual(previousBoard, room.game.board)
    ) {
      this.animateShift(
        previousBoard,
        room.game.board,
        room.game.lastBoardShift ?? undefined,
      );
    }
  }

  public setEnteringRoom(value: boolean) {
    this.isEnteringRoom = value;
  }

  public getActiveRoomCode() {
    return this._activeRoomCodeStorage.get();
  }

  public isMemberOf(room: TRoom) {
    if (this.sessionId === undefined) return false;
    return room.members.some((m) => m.sessionId === this.sessionId);
  }

  public clearActiveRoom() {
    this.room = undefined;
    this.chat = this._getChatDefaultState();
    this.boardShiftAnim = null;
    this.lastPlayedShiftSeq = 0;
    this._activeRoomCodeStorage.remove();
  }

  public setRouter(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }

  public setPathname(pathname: ReturnType<typeof usePathname>) {
    this.pathname = pathname;
  }

  public leaveRoom() {
    if (this.room === undefined) return;

    this.suppressAutoJoin = true;
    socket.emit(SocketEvents.LeaveRoom, this.room.roomCode);
    this.clearActiveRoom();
    this.router?.push("/");
  }

  public handleKicked() {
    this.suppressAutoJoin = true;
    this.clearActiveRoom();
    this.router?.push("/");
  }

  public kickUser(targetSessionId: string) {
    if (this.room === undefined) return;

    socket.emit(SocketEvents.KickUser, {
      roomCode: this.room.roomCode,
      targetSessionId,
    });
  }

  public startGame() {
    if (this.room === undefined) return;
    if (!this.isAdmin) return;

    socket.emit(SocketEvents.StartGame, {
      roomCode: this.room.roomCode,
    });
  }

  public endTurn() {
    if (this.room === undefined) return;
    if (!this.isMyTurn) return;

    socket.emit(SocketEvents.EndTurn, {
      roomCode: this.room.roomCode,
    });
  }

  public shiftBoard(shift: BoardShift) {
    if (this.room === undefined) return;
    if (!this.isMyTurn) return;
    if (this.room.game.boardShiftUsedThisTurn) return;
    if (this.boardShiftAnim !== null) return;

    const boardBefore = this.room.game.board.map((c) => ({ ...c }));
    const boardAfter = shiftBoardCharacters(
      boardBefore,
      this.room.game.boardSize,
      shift,
    );

    // Оптимистичная анимация до ответа сервера
    this.animateShift(boardBefore, boardAfter, {
      ...shift,
      seq: LOCAL_BOARD_SHIFT_SEQ,
    });

    socket.emit(SocketEvents.ShiftBoard, {
      roomCode: this.room.roomCode,
      shift,
    });
  }

  /**
   * Запускает анимацию сдвига по состояниям доски «до» и «после».
   * RoomUpdated только меняет room; анимацией занимается эта функция.
   */
  public animateShift(
    boardBefore: BoardCharacter[],
    boardAfter: BoardCharacter[],
    knownShift?: BoardShift & { seq?: number },
  ) {
    if (boardsEqual(boardBefore, boardAfter)) return;

    const boardSize = Math.sqrt(boardBefore.length);
    if (!Number.isInteger(boardSize) || boardSize <= 0) return;

    // У инициатора уже крутится локальная анимация — только подтверждаем seq
    if (
      this.boardShiftAnim !== null &&
      this.boardShiftAnim.seq === LOCAL_BOARD_SHIFT_SEQ
    ) {
      const seq = knownShift?.seq;
      if (seq !== undefined && seq > 0) {
        this.lastPlayedShiftSeq = seq;
        this.boardShiftAnim = { ...this.boardShiftAnim, seq };
      }
      return;
    }

    if (this.boardShiftAnim !== null) return;

    const detected =
      knownShift ??
      detectBoardShift(boardBefore, boardAfter, boardSize) ??
      undefined;

    if (detected === undefined) return;

    const seq =
      "seq" in detected && typeof detected.seq === "number"
        ? detected.seq
        : this.lastPlayedShiftSeq + 1;

    if (seq > 0 && seq <= this.lastPlayedShiftSeq) return;

    if (seq > 0) {
      this.lastPlayedShiftSeq = seq;
    }

    this.boardShiftAnim = {
      seq,
      shift: {
        axis: detected.axis,
        index: detected.index,
        direction: detected.direction,
      },
      boardBefore: boardBefore.map((c) => ({ ...c })),
      boardAfter: boardAfter.map((c) => ({ ...c })),
      boardSize,
    };
  }

  public clearBoardShiftAnim() {
    this.boardShiftAnim = null;
  }

  public joinRoom() {
    const { roomCode } = this.loginForm;
    const { userName } = this;
    const sessionId = this.ensureSessionId();

    if (userName === undefined || this.isEnteringRoom) return;

    this.suppressAutoJoin = false;
    this.isEnteringRoom = true;
    socket.emit(SocketEvents.JoinRoom, {
      userName,
      roomCode,
      sessionId,
    });
  }

  public joinRoomByLink(roomCode?: string) {
    if (this.room) return;

    const { userName } = this;
    const sessionId = this.ensureSessionId();

    if (userName === undefined || roomCode === undefined) return;

    this.suppressAutoJoin = false;
    socket.emit(SocketEvents.JoinRoom, {
      userName,
      roomCode,
      sessionId,
    });
  }

  public reconnectToRoom(roomCode?: string) {
    if (this.suppressAutoJoin) return false;

    const code = roomCode ?? this._activeRoomCodeStorage.get();
    const sessionId = this.ensureSessionId();

    if (code === undefined) return false;

    socket.emit(SocketEvents.ReconnectRoom, {
      roomCode: code,
      sessionId,
    });

    return true;
  }

  /** Переподключение при активной сессии комнаты, иначе вход по коду */
  public enterRoom(roomCode: string) {
    if (this.suppressAutoJoin) return;
    if (this.room) return;

    const sessionId = this.ensureSessionId();
    if (this.userName === undefined) return;

    const activeCode = this._activeRoomCodeStorage.get();

    if (activeCode === roomCode) {
      this.reconnectToRoom(roomCode);
      return;
    }

    socket.emit(SocketEvents.JoinRoom, {
      userName: this.userName,
      roomCode,
      sessionId,
    });
  }

  public tryAutoReconnect() {
    if (this.suppressAutoJoin) return;
    if (this.room) return;

    const activeCode = this._activeRoomCodeStorage.get();
    if (activeCode === undefined) return;

    this.reconnectToRoom(activeCode);
  }

  public createRoom() {
    const { userName } = this;
    const sessionId = this.ensureSessionId();

    if (userName === undefined || this.isEnteringRoom) return;

    this.suppressAutoJoin = false;
    this.isEnteringRoom = true;
    socket.emit(SocketEvents.CreateRoom, {
      userName,
      sessionId,
    });
  }

  private _getLoginFormDefaultState(): TLoginForm {
    return {
      roomCode: "",
      type: LoginType.Join,
    };
  }

  private _getChatDefaultState(): TChat {
    return {
      inputMessage: "",
      messages: [],
    };
  }
}

export const store = new Store();
