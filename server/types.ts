export enum SocketEvents {
  Disconnect = "disconnect",
  Connection = "connection",

  CreateRoom = "create-room",
  RoomCreated = "room-created",

  JoinRoom = "join-room",
  UserJoined = "user-joined",
  RoomNotFound = "room-not-found",

  ReciveMessage = "recive-message",
  SendMesage = "send-message",

  HealthCheck = "health-check",
}

export type TSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type TErrorResponse = {
  success: false;
  message: string;
};

export type TBaseApiResponse<T> = TSuccessResponse<T> | TErrorResponse;

export type TUser = {
  id: string;
  name: string;
  isAdmin?: boolean;
};

export type TMessage = {
  content: string;
  sender: TUser;
};

export type TRoom = {
  roomCode: string; // uniq
  users: TUser[];
};

export type ClientToServerEvents = {
  [SocketEvents.JoinRoom]: ({
    roomCode,
    userName,
  }: {
    roomCode: string;
    userName: string;
  }) => void;
  [SocketEvents.CreateRoom]: (userName: string) => void;
};

export type ServerToClientEvents = {
  [SocketEvents.RoomCreated]: (room: TRoom) => void;
  [SocketEvents.ReciveMessage]: (message: TMessage) => void;
  [SocketEvents.UserJoined]: (room: TRoom) => void;
  [SocketEvents.RoomNotFound]: (roomCode: string) => void;
};
