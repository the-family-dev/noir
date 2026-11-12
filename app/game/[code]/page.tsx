import { redirect } from "next/navigation";
import { getRoomPath } from "@/utils/room-link";

type TProps = {
  params: Promise<{ code: string }>;
};

/**
 * Старый адрес комнаты (/game/<код>) оставлен для уже разосланных ссылок:
 * постоянный адрес теперь /room/<код>.
 */
export default async function LegacyGameRoomPage({ params }: TProps) {
  const { code } = await params;

  redirect(getRoomPath(code));
}

