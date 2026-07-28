"use client";

import { observer } from "mobx-react-lite";
import { RoomUserCard } from "./room-user-card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UsersIcon } from "lucide-react";
import { store } from "@/store/store";

export const RoomParticipantsList = observer(function RoomParticipantsList() {
  const { room } = store;

  if (room === undefined) return null;

  const membersCount = room.members.length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className="shrink-0"
            variant="secondary"
            size="icon"
            aria-label="Участники"
          />
        }
      >
        <UsersIcon className="size-5" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-72">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground font-medium">
            Участники ({membersCount})
          </div>
          <div className="flex flex-col gap-1.5">
            {membersCount === 0 ? (
              <span className="text-sm text-muted-foreground">
                Нет участников
              </span>
            ) : (
              room.members.map((user) => (
                <RoomUserCard key={user.sessionId} user={user} />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});
