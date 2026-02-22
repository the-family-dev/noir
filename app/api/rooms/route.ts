import { rooms } from "@/server/data";
import { TRoom } from "@/server/types";
import { getBaseResponse } from "@/server/utils";
import { generateCode } from "@/utils/code-generaator";
import { NextResponse } from "next/server";

export type TcreateRoomResponse = ReturnType<typeof getBaseResponse<TRoom>>;

// POST запрос - создание данных
export async function POST() {
  const response = getBaseResponse<TRoom>();

  try {
    const roomCode = generateCode(4);

    if (rooms.has(roomCode)) {
      response.message = "Room already exists";
      return NextResponse.json(response, { status: 500 });
    }

    // Создаем комнату
    const newRoom: TRoom = {
      roomCode,
      users: [],
    };

    rooms.set(roomCode, newRoom);

    response.success = true;

    if (response.success) {
      response.data = newRoom;
      response.message = "Room created";
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(response, { status: 500 });
  } catch {
    response.success = false;
    return NextResponse.json(response, { status: 500 });
  }
}
