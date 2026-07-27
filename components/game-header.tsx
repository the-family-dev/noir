"use client";
import { observer } from "mobx-react-lite";
import { NameLabel } from "./name-label";
import { RoomActions } from "./room-actions";
import { store } from "@/store/store";

export const GameHeader = observer(() => {
  const { room } = store;

  return (
    <div className="flex flex-row items-end justify-between w-full h-fit gap-4">
      <NameLabel />
      <div className="flex flex-col items-center gap-1 flex-1">
        {room ? (
          <p className="font-mono text-sm text-muted-foreground">
            {room.roomCode}
          </p>
        ) : null}
      </div>
      <RoomActions />
    </div>
  );
});
