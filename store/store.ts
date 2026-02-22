"use-client";
import { makeAutoObservable } from "mobx";
import { SocketEvents, TMessage } from "@/server/types";
import { socket } from "@/lib/socket";

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

class Store {
  loginForm: TLoginForm = this._getLoginFormDefaultState();
  chat: TChat = {
    inputMessage: "",
    messages: [
      {
        content: "test",
        sender: {
          id: "asfdasefsdfgsed",
          name: "Ivan",
        },
      },
      {
        content:
          "ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        sender: {
          id: "asfdasefsdfgsed",
          name: "Ivan",
        },
      },
    ],
  };

  constructor() {
    makeAutoObservable(this);
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
    store.chat.inputMessage = "";
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
