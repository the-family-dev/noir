export enum SocketEvents {
  Disconnect = "disconnect",
  Connection = "connection",
  JoinRoom = "join-room",
  UserJoined = "user-joined",
  CreateRoom = "create-room",

  ReciveMessage = "recive-message",
  SendMesage = "send-message",

  HealthCheck = "health-check",
}

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
  [SocketEvents.ReciveMessage]: (message: TMessage) => void;
  [SocketEvents.UserJoined]: (room: TRoom) => void;
};
