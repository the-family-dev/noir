import { notFound, redirect } from "next/navigation";
import { isValidRoomCode } from "@/utils/code-generaator";
import { getRoomPath, normalizeRoomCode } from "@/utils/room-link";

type TProps = {
  params: Promise<{ code: string }>;
};

/**
 * Короткая ссылка на комнату: /<код> → /room/<код>. Так можно отправить
 * и полную ссылку, и просто дописать код к адресу игры.
 */
export default async function ShortRoomLinkPage({ params }: TProps) {
  const { code } = await params;
  const roomCode = normalizeRoomCode(code);

  // Статические маршруты (/game, /room) Next разбирает раньше этого файла,
  // поэтому сюда попадают только «лишние» адреса
  if (!isValidRoomCode(roomCode)) notFound();

  redirect(getRoomPath(roomCode));
}
