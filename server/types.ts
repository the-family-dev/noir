export enum SocketEvents {
  Disconnect = "disconnect",
  Connection = "connection",

  CreateRoom = "create-room",
  RoomCreated = "room-created",

  JoinRoom = "join-room",
  UserJoined = "user-joined",
  MyUserJoined = "my-user-joined",
  RoomNotFound = "room-not-found",
  RoomUpdated = "room-updated",
  RoomError = "room-error",

  StartGame = "start-game",
  PlayAgain = "play-again",

  ShiftRow = "shift-row",
  ShiftColumn = "shift-column",
  RefreshField = "refresh-field",
  CatchSpy = "catch-spy",
  InterrogateSuspect = "interrogate-suspect",

  ReciveMessage = "recive-message",
  SendMessage = "send-message",

  HealthCheck = "health-check",
  ConnectionsCount = "connections-count",
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

/** Карта подозреваемого: имя и занятие (используется и на клиенте) */
export type TSuspect = {
  id: string;
  name: string;
  role: string;
};

/** Клетка игрового поля. dead === true — подозреваемый пойман (сторона «погиб») */
export type TBoardCell = {
  suspectId: string;
  dead: boolean;
};

export enum GamePhase {
  Lobby = "lobby",
  Playing = "playing",
  Finished = "finished",
}

export type TLogKind =
  | "info"
  | "shift"
  | "refresh"
  | "catch"
  | "miss"
  | "interrogate"
  | "win"
  | "leave";

export type TLogEntry = {
  id: number;
  kind: TLogKind;
  text: string;
};

/** Результат допроса: кто поднял руку и какую цель допрашивали */
export type TInterrogation = {
  byPlayerId: string;
  cellIndex: number;
  suspectId: string;
  handRaiserIds: string[];
};

export type TGamePlayer = {
  id: string;
  name: string;
  isAdmin?: boolean;
  connected: boolean;
  /** Карты доказательств, забранные как трофеи (id подозреваемых) — открытая информация */
  trophies: string[];
  /** Тайная личность — id подозреваемого. Никогда не покидает сервер для чужих игроков */
  identityId?: string;
};

export type TGame = {
  phase: GamePhase;
  /** Сторона поля: 5, 6 или 7 */
  size: number;
  /** Поле, построчно (row-major) */
  board: TBoardCell[];
  /** Колода доказательств: id подозреваемых, которые ещё могут стать тайной личностью */
  deck: string[];
  /** Индекс текущего игрока в room.users */
  turnIndex: number;
  targetTrophies: number;
  log: TLogEntry[];
  lastInterrogation?: TInterrogation;
  winnerId?: string;
};

export type TRoom = {
  roomCode: string; // uniq
  users: TGamePlayer[];
  game?: TGame;
};

// ------------------------- Клиентские (персональные) представления -------------------------

/** Игрок в том виде, в котором его видят другие: без тайной личности */
export type TPlayerView = Omit<TGamePlayer, "identityId">;

export type TGameView = {
  phase: GamePhase;
  size: number;
  board: TBoardCell[];
  turnPlayerId: string;
  targetTrophies: number;
  deckSize: number;
  log: TLogEntry[];
  lastInterrogation?: TInterrogation;
  winnerId?: string;
  /** Тайная личность только самого получателя */
  myIdentityId?: string;
  /** Индекс клетки с тайной личностью получателя (-1, если личности нет) */
  myIndex: number;
};

export type TRoomView = {
  roomCode: string;
  users: TPlayerView[];
  game?: TGameView;
};

// ------------------------------- Игровые действия -------------------------------

export type TGameAction =
  | { type: "shift-row"; row: number; direction: 1 | -1 }
  | { type: "shift-column"; column: number; direction: 1 | -1 }
  | { type: "refresh" }
  | { type: "catch"; cellIndex: number }
  | { type: "interrogate"; cellIndex: number };

export type GameActionParams = {
  roomCode: string;
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
  [SocketEvents.StartGame]: (params: GameActionParams) => void;
  [SocketEvents.PlayAgain]: (params: GameActionParams) => void;
  [SocketEvents.ShiftRow]: (
    params: GameActionParams & { row: number; direction: 1 | -1 },
  ) => void;
  [SocketEvents.ShiftColumn]: (
    params: GameActionParams & { column: number; direction: 1 | -1 },
  ) => void;
  [SocketEvents.RefreshField]: (params: GameActionParams) => void;
  [SocketEvents.CatchSpy]: (
    params: GameActionParams & { cellIndex: number },
  ) => void;
  [SocketEvents.InterrogateSuspect]: (
    params: GameActionParams & { cellIndex: number },
  ) => void;
  [SocketEvents.SendMessage]: ({
    roomCode,
    message,
  }: {
    roomCode: string;
    message: TMessage;
  }) => void;
};

export type ServerToClientEvents = {
  [SocketEvents.RoomCreated]: (room: TRoomView) => void;
  [SocketEvents.ReciveMessage]: (message: TMessage) => void;
  [SocketEvents.UserJoined]: (room: TRoomView) => void;
  [SocketEvents.RoomUpdated]: (room: TRoomView) => void;
  [SocketEvents.RoomNotFound]: (roomCode: string) => void;
  [SocketEvents.RoomError]: (message: string) => void;
  [SocketEvents.MyUserJoined]: (user: TUser) => void;
};
