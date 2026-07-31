import { makeAutoObservable } from "mobx";
import { SocketEvents, TMessage } from "@/server/types";
import { socket } from "@/lib/socket";

/** Минимальный доступ к корневому стору для отправки сообщений */
export type ChatRootAccess = {
  room: { roomCode: string } | undefined;
  userName: string | undefined;
};

/** Состояние и действия чата комнаты */
export class ChatStore {
  inputMessage = "";
  messages: TMessage[] = [];
  /** Панель чата развёрнута поверх поля */
  isOpen = false;

  constructor(private root: ChatRootAccess) {
    makeAutoObservable(this);
  }

  public setMessage(message: string) {
    this.inputMessage = message;
  }

  public setOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  public toggle() {
    this.isOpen = !this.isOpen;
  }

  public send() {
    if (this.root.room === undefined) return;
    if (this.root.userName === undefined) return;
    if (this.inputMessage.trim() === "") return;

    socket.emit(SocketEvents.SendMessage, {
      roomCode: this.root.room.roomCode,
      message: {
        content: this.inputMessage,
        sender: this.root.userName,
      },
    });

    this.inputMessage = "";
  }

  public receive(message: TMessage) {
    this.messages.push(message);
  }

  /** Сброс при выходе / кике из комнаты */
  public reset() {
    this.inputMessage = "";
    this.messages = [];
    this.isOpen = false;
  }
}
