import { generateCode } from "@/utils/code-generator";
import { TRoom, TUser } from "./types";

class RoomService {
  rooms = new Map<string, TRoom>();

  public createRoom(user: TUser) {
    const room: TRoom = {
      roomCode: generateCode(8),
      members: [user],
    };

    this.rooms.set(room.roomCode, room);

    return room;
  }

  public getRoom(roomCode: string): TRoom | undefined {
    return this.rooms.get(roomCode);
  }

  public findMemberBySocketId(socketId: string): {
    room: TRoom;
    member: TUser;
  } | undefined {
    for (const room of this.rooms.values()) {
      const member = room.members.find((m) => m.socketId === socketId);
      if (member) {
        return { room, member };
      }
    }
    return undefined;
  }

  public findMemberBySessionId(
    room: TRoom,
    sessionId: string,
  ): TUser | undefined {
    return room.members.find((m) => m.sessionId === sessionId);
  }

  public findMemberByName(room: TRoom, name: string): TUser | undefined {
    return room.members.find((m) => m.name === name);
  }

  public reconnectMember(
    room: TRoom,
    sessionId: string,
    socketId: string,
  ): TUser | undefined {
    const member = this.findMemberBySessionId(room, sessionId);
    if (member === undefined) return undefined;

    member.socketId = socketId;
    member.disconnected = false;
    return member;
  }

  public markDisconnected(socketId: string): TRoom | undefined {
    const found = this.findMemberBySocketId(socketId);
    if (found === undefined) return undefined;

    found.member.disconnected = true;
    return found.room;
  }

  public removeMember(room: TRoom, predicate: (m: TUser) => boolean): TUser | undefined {
    const index = room.members.findIndex(predicate);
    if (index === -1) return undefined;

    const [removed] = room.members.splice(index, 1);
    return removed;
  }

  public deleteRoomIfEmpty(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (room === undefined) return;

    if (room.members.length === 0) {
      this.rooms.delete(roomCode);
    }
  }
}

export const roomService = new RoomService();
