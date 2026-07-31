import { makeAutoObservable } from "mobx";

export enum LoginType {
  Join = "join",
  Create = "create",
}

type TLoginFormFields = {
  roomCode: string;
  type: LoginType;
};

/** Состояние формы входа / создания комнаты */
export class LoginFormStore {
  roomCode = "";
  type: LoginType = LoginType.Join;

  constructor() {
    makeAutoObservable(this);
  }

  public setField<K extends keyof TLoginFormFields>(
    field: K,
    value: TLoginFormFields[K],
  ) {
    this[field] = value;
  }

  /** Сброс к значениям по умолчанию */
  public reset() {
    this.roomCode = "";
    this.type = LoginType.Join;
  }
}
