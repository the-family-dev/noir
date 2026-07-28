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

  StartGame = "start-game",
  EndTurn = "end-turn",
  ShiftBoard = "shift-board",
  Interrogate = "interrogate",
  CatchSuspect = "catch-suspect",

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
  GameAlreadyStarted = "GAME_ALREADY_STARTED",
  NotEnoughPlayers = "NOT_ENOUGH_PLAYERS",
  InvalidPhase = "INVALID_PHASE",
  NotYourTurn = "NOT_YOUR_TURN",
  ActionAlreadyUsed = "ACTION_ALREADY_USED",
  InvalidMove = "INVALID_MOVE",
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

/** Этапы матча Noir внутри комнаты */
export enum GamePhase {
  /** Игроки заходят; размер поля зависит от их числа */
  Preparation = "preparation",
  /** Поочерёдная игра на поле (действия — позже) */
  Playing = "playing",
  /** Итоги и победитель (подсчёт — позже) */
  Finished = "finished",
}

export type BoardCharacter = {
  id: string;
  name: string;
  /** Карточка убита после удачной поимки */
  isDead?: boolean;
};

export type BoardShiftAxis = "row" | "column";
export type BoardShiftDirection = "positive" | "negative";

export type BoardShift = {
  axis: BoardShiftAxis;
  index: number;
  direction: BoardShiftDirection;
};

/** Публичный результат допроса — без раскрытия чужих assignments */
export type BoardInterrogation = {
  seq: number;
  /** Кто провёл допрос */
  actorSessionId: string;
  /** Цель допроса на поле */
  targetCharacterId: string;
  /** Цель + соседние карточки — зона подсветки на поле */
  zoneCharacterIds: string[];
  /** Игроки, которые «поднимают руку» */
  revealingSessionIds: string[];
};

/** Публичный результат попытки поймать */
export type BoardCatch = {
  seq: number;
  actorSessionId: string;
  targetCharacterId: string;
  accusedSessionId: string;
  /** Угадал ли личность */
  hit: boolean;
};

export type NoirGameState = {
  phase: GamePhase;
  /** Длина стороны квадратного поля (например, 5 → 5×5) */
  boardSize: number;
  /** Карточки на поле; пусто на подготовке */
  board: BoardCharacter[];
  /**
   * sessionId → id персонажа.
   * На клиент уходит только своя запись (чужие личности скрыты).
   */
  assignments: Record<string, string>;
  /** sessionId игрока, чей сейчас ход; null вне фазы игры */
  currentTurnSessionId: string | null;
  /** Сдвиг поля уже сделан в этом ходу */
  boardShiftUsedThisTurn: boolean;
  /** Допрос уже сделан в этом ходу */
  interrogateUsedThisTurn: boolean;
  /** Поимка уже сделана в этом ходу */
  catchUsedThisTurn: boolean;
  /** Последний сдвиг — для анимации у клиентов */
  lastBoardShift: (BoardShift & { seq: number }) | null;
  /** Последний допрос — результат виден всем до конца хода */
  lastInterrogation: BoardInterrogation | null;
  /** Последняя попытка поймать — результат виден всем до конца хода */
  lastCatch: BoardCatch | null;
};

export type TRoom = {
  roomCode: string;
  members: TUser[];
  game: NoirGameState;
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
  [SocketEvents.StartGame]: (params: { roomCode: string }) => void;
  [SocketEvents.EndTurn]: (params: { roomCode: string }) => void;
  [SocketEvents.ShiftBoard]: (params: {
    roomCode: string;
    shift: BoardShift;
  }) => void;
  [SocketEvents.Interrogate]: (params: {
    roomCode: string;
    targetCharacterId: string;
  }) => void;
  [SocketEvents.CatchSuspect]: (params: {
    roomCode: string;
    targetCharacterId: string;
    accusedSessionId: string;
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
