"use-client";
import { makeAutoObservable } from "mobx";
import { SocketEvents } from "@/server/types";
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

class Store {
  loginForm: TLoginForm = this._getLoginFormDefaultState();

  constructor() {
    makeAutoObservable(this);
  }

  public setLoginFormField<K extends keyof TLoginForm>(
    field: K,
    value: TLoginForm[K],
  ) {
    this.loginForm[field] = value;
  }

  public joinRoom() {
    const { userName, roomCode } = this.loginForm;

    socket.emit(SocketEvents.JoinRoom, {
      userName,
      roomCode,
    });

    this.loginForm = this._getLoginFormDefaultState();
  }

  public createRoom() {
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
}

export const store = new Store();
