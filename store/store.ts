"use-client";
import { makeAutoObservable } from "mobx";
import { SocketEvents, TMessage, TRoom, TUser } from "@/server/types";
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

const nameStorageKey = "nameKey";

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

  room: TRoom | undefined = undefined;

  user: TUser | undefined = undefined;

  router: ReturnType<typeof useRouter> | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
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

  public setRoom(room: TRoom) {
    this.room = room;
  }

  public setRouter(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }

  public setUser(user: TUser) {
    this.user = user;
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
