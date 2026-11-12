"use client";
import { makeAutoObservable } from "mobx";
import {
  SocketEvents,
  TGameView,
  TMessage,
  TPlayerView,
  TRoomView,
  TUser,
} from "@/server/types";
import { socket } from "@/lib/socket";
import { TypedStorage } from "../utils/storage";
import { useRouter } from "next/navigation";

export enum LoginType {
  Join = "join",
  Create = "create",
}

type TLoginForm = {
  userName: string;
  roomCode: string;
  type: LoginType;
};

type TChat = {
  inputMessage: string;
  messages: TMessage[];
};

export type TNotificationStatus =
  | "accent"
  | "danger"
  | "default"
  | "success"
  | "warning";

export type TNotification = {
  id: number;
  message: string;
  status: TNotificationStatus;
};

const nameStorageKey = "nameKey";

class Store {
  loginForm: TLoginForm = this._getLoginFormDefaultState();
  chat: TChat = {
    inputMessage: "",
    messages: [],
  };

  notifications: TNotification[] = [];

  private _lastNotificationId = 0;

  private _nameStorage = new TypedStorage<string | undefined>(
    nameStorageKey,
    undefined,
  );

  room: TRoomView | undefined = undefined;

  user: TUser | undefined = undefined;

  router: ReturnType<typeof useRouter> | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  public get game(): TGameView | undefined {
    return this.room?.game;
  }

  public get me(): TPlayerView | undefined {
    if (this.room === undefined || this.user === undefined) return undefined;
    return this.room.users.find((user) => user.id === this.user?.id);
  }

  public get isAdmin(): boolean {
    // Права создателя комнаты живут в списке игроков: они могут перейти
    // другому участнику, если создатель покинул комнату.
    const me = this.me;

    if (me !== undefined) return me.isAdmin === true;

    return this.user?.isAdmin === true;
  }

  public get turnPlayer(): TPlayerView | undefined {
    const { game, room } = this;
    if (game === undefined || room === undefined) return undefined;
    return room.users.find((user) => user.id === game.turnPlayerId);
  }

  public get isMyTurn(): boolean {
    if (this.user === undefined || this.game === undefined) return false;
    return this.game.turnPlayerId === this.user.id;
  }

  public get myTrophies(): string[] {
    return this.me?.trophies ?? [];
  }

  public getStoredName() {}

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

    if (this.user === undefined) return;

    if (this.chat.inputMessage.trim() === "") return;

    socket.emit(SocketEvents.SendMessage, {
      roomCode: this.room.roomCode,
      message: {
        content: this.chat.inputMessage,
        sender: this.user,
      },
    });

    this.chat.inputMessage = "";
  }

  public reciveMessage(message: TMessage) {
    this.chat.messages.push(message);
  }

  public setRoom(room: TRoomView) {
    this.room = room;
  }

  public setRouter(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }

  public setUser(user: TUser) {
    this.user = user;
  }

  public notify(message: string, status: TNotificationStatus = "default") {
    this._lastNotificationId += 1;
    const id = this._lastNotificationId;

    this.notifications.push({ id, message, status });
    this.notifications = this.notifications.slice(-4);

    setTimeout(() => this.dismissNotification(id), 5000);
  }

  public dismissNotification(id: number) {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id,
    );
  }

  public joinRoom() {
    const { userName, roomCode } = this.loginForm;

    socket.emit(SocketEvents.JoinRoom, {
      userName,
      roomCode,
    });

    this.loginForm = this._getLoginFormDefaultState();
  }

  public async createRoom() {
    const { userName } = this.loginForm;

    socket.emit(SocketEvents.CreateRoom, userName);

    this.loginForm = this._getLoginFormDefaultState();
  }

  // ------------------------------- Игровые действия -------------------------------

  public startGame() {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.StartGame, { roomCode: this.room.roomCode });
  }

  public playAgain() {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.PlayAgain, { roomCode: this.room.roomCode });
  }

  public shiftRow(row: number, direction: 1 | -1) {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.ShiftRow, {
      roomCode: this.room.roomCode,
      row,
      direction,
    });
  }

  public shiftColumn(column: number, direction: 1 | -1) {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.ShiftColumn, {
      roomCode: this.room.roomCode,
      column,
      direction,
    });
  }

  public refreshField() {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.RefreshField, { roomCode: this.room.roomCode });
  }

  public catchSpy(cellIndex: number) {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.CatchSpy, {
      roomCode: this.room.roomCode,
      cellIndex,
    });
  }

  public interrogateSuspect(cellIndex: number) {
    if (this.room === undefined) return;
    socket.emit(SocketEvents.InterrogateSuspect, {
      roomCode: this.room.roomCode,
      cellIndex,
    });
  }

  private _getLoginFormDefaultState(): TLoginForm {
    return {
      userName: "",
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
