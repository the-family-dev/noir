"use client";
import { makeAutoObservable } from "mobx";
import {
  SocketEvents,
  TRoom,
  TUser,
  BoardShift,
  BoardRefreshAxis,
} from "@/server/types";
import { socket } from "@/lib/socket";
import { TypedStorage } from "@/utils/storage";
import {
  activeRoomCodeStorageKey,
  nameStorageKey,
  sessionIdStorageKey,
} from "@/utils/constants";
import { isTurnActionUsed } from "@/utils/turn-action";
import { usePathname, useRouter } from "next/navigation";
import { ChatStore } from "@/stores/chat-store";
import { LoginFormStore } from "@/stores/login-form-store";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class Store {
  /** Вложенный стор формы входа */
  loginForm = new LoginFormStore();
  /** Вложенный стор чата комнаты */
  chat = new ChatStore(this);

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

  router: ReturnType<typeof useRouter> | undefined = undefined;
  pathname: ReturnType<typeof usePathname> | undefined = undefined;

  constructor() {
    // вложенные сторы уже observable — не оборачиваем повторно
    makeAutoObservable(this, { chat: false, loginForm: false });
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

  public setRoom(room: TRoom) {
    this.room = room;
    this.isEnteringRoom = false;
    this._activeRoomCodeStorage.set(room.roomCode);
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
    this.chat.reset();
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
    if (!isTurnActionUsed(this.room.game)) return;

    socket.emit(SocketEvents.EndTurn, {
      roomCode: this.room.roomCode,
    });
  }

  public shiftBoard(shift: BoardShift) {
    if (this.room === undefined) return;
    if (!this.isMyTurn) return;
    if (isTurnActionUsed(this.room.game)) return;

    socket.emit(SocketEvents.ShiftBoard, {
      roomCode: this.room.roomCode,
      shift,
    });
  }

  public refreshBoard(axis: BoardRefreshAxis) {
    if (this.room === undefined) return;
    if (!this.isMyTurn) return;
    if (isTurnActionUsed(this.room.game)) return;

    socket.emit(SocketEvents.RefreshBoard, {
      roomCode: this.room.roomCode,
      axis,
    });
  }

  public interrogate(targetCharacterId: string) {
    if (this.room === undefined) return;
    if (!this.isMyTurn) return;
    if (isTurnActionUsed(this.room.game)) return;

    socket.emit(SocketEvents.Interrogate, {
      roomCode: this.room.roomCode,
      targetCharacterId,
    });
  }

  public catchSuspect(targetCharacterId: string, accusedSessionId: string) {
    if (this.room === undefined) return;
    if (!this.isMyTurn) return;
    if (this.sessionId === undefined) return;
    if (accusedSessionId === this.sessionId) return;
    if (isTurnActionUsed(this.room.game)) return;

    socket.emit(SocketEvents.CatchSuspect, {
      roomCode: this.room.roomCode,
      targetCharacterId,
      accusedSessionId,
    });
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
}

export const store = new Store();
