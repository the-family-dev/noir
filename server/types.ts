export enum SocketEvents {
  Disconnect = "disconnect",
  Connection = "connection",

  CreateRoom = "create-room",
  RoomCreated = "room-created",
  JoinRoom = "join-room",
  ReconnectRoom = "reconnect-room",
  LeaveRoom = "leave-room",
  UserReconnected = "user-reconnected",

  KickUser = "kick-user",
  UserKicked = "user-kicked",

  AnyError = "any-error",

  RoomUpdated = "room-updated",

  ReceiveMessage = "receive-message",
  SendMessage = "send-message",
}

export enum RoomErrorCode {
  RoomNotFound = "ROOM_NOT_FOUND",
  SessionNotFound = "SESSION_NOT_FOUND",
  NameTaken = "NAME_TAKEN",
  NotAdmin = "NOT_ADMIN",
  MemberNotFound = "MEMBER_NOT_FOUND",
}

export type RoomError = {
  code: RoomErrorCode;
  message: string;
};

export type RoomOk<T> = { ok: true } & T;
export type RoomFail = { ok: false } & RoomError;
export type RoomResult<T> = RoomOk<T> | RoomFail;

export type TUser = {
  socketId: string;
  sessionId: string;
  name: string;
  isAdmin?: boolean;
  disconnected?: boolean;
};

export type TMessage = {
  content: string;
  sender: string;
};

export type TRoom = {
  roomCode: string;
  members: TUser[];
};

export type ClientToServerEvents = {
  [SocketEvents.JoinRoom]: (params: {
    roomCode: string;
    userName: string;
    sessionId: string;
  }) => void;
  [SocketEvents.CreateRoom]: (params: {
    userName: string;
    sessionId: string;
  }) => void;
  [SocketEvents.ReconnectRoom]: (params: {
    roomCode: string;
    sessionId: string;
  }) => void;
  [SocketEvents.SendMessage]: (params: {
    roomCode: string;
    message: TMessage;
  }) => void;
  [SocketEvents.LeaveRoom]: (roomCode: string) => void;
  [SocketEvents.KickUser]: (params: {
    roomCode: string;
    targetSessionId: string;
  }) => void;
};

export type ServerToClientEvents = {
  [SocketEvents.RoomCreated]: (room: TRoom) => void;
  [SocketEvents.ReceiveMessage]: (message: TMessage) => void;
  [SocketEvents.UserReconnected]: (user: TUser) => void;
  [SocketEvents.RoomUpdated]: (room: TRoom) => void;
  [SocketEvents.UserKicked]: () => void;
  [SocketEvents.AnyError]: (error: RoomError) => void;
};
