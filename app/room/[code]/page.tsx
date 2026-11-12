"use client";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { JoinRoomCard } from "@/components/join-room-card";
import { Room } from "@/components/room";
import { store } from "@/store/store";
import { normalizeRoomCode } from "@/utils/room-link";

/**
 * Ссылка-приглашение: /room/<код>. Игрок с уже открытой комнатой видит её
 * сразу, остальным показываем форму входа с подставленным кодом.
 */
export default observer(function RoomPage() {
  const params = useParams<{ code?: string }>();
  const roomCode = normalizeRoomCode(params?.code);

  if (store.room !== undefined && store.room.roomCode === roomCode) {
    return <Room />;
  }

  return <JoinRoomCard roomCode={roomCode} />;
});
