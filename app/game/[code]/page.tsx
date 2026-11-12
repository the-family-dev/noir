"use client";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { store } from "../../../store/store";
import { Room } from "@/components/room";

export default observer(function Game() {
  const { room } = store;

  const { code } = useParams<{
    code?: string;
  }>();

  if (room !== undefined && room.roomCode === code) {
    return <Room />;
  }

  return (
    <div className="flex flex-col gap-2">
      <p>Комната {code}</p>
      <p className="text-sm text-neutral-400">
        Чтобы войти в игру, присоединитесь к комнате по коду на главной странице.
      </p>
    </div>
  );
});

