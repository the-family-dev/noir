import { TRoom } from "../server/types";

export function isAdminSocket(room: TRoom, socketId: string): boolean {
  return room.members.some(
    (user) => user.socketId === socketId && user.isAdmin === true,
  );
}
