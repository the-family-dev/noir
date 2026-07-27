export enum SocketEvents {
  Disconnect = "disconnect",
  Connection = "connection",

  CreateRoom = "create-room",
  RoomCreated = "room-created",
  JoinRoom = "join-room",
  ReconnectRoom = "reconnect-room",
  LeaveRoom = "leave-room",
  UserJoined = "user-joined",
  MyUserJoined = "my-user-joined",
  UserReconnected = "user-reconnected",

  KickUser = "kick-user",
  UserKicked = "user-kicked",

  AnyError = "any-error",

  RoomUpdated = "room-updated",

  ReciveMessage = "recive-message",
  SendMessage = "send-message",
}

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
    targetUserName: string;
  }) => void;
};

export type ServerToClientEvents = {
  [SocketEvents.RoomCreated]: (room: TRoom) => void;
  [SocketEvents.ReciveMessage]: (message: TMessage) => void;
  [SocketEvents.UserJoined]: (room: TRoom) => void;
  [SocketEvents.MyUserJoined]: (user: TUser) => void;
  [SocketEvents.UserReconnected]: (user: TUser) => void;
  [SocketEvents.RoomUpdated]: (room: TRoom) => void;
  [SocketEvents.UserKicked]: () => void;
  [SocketEvents.AnyError]: (message: string) => void;
};
