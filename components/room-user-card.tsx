"use client";

import { observer } from "mobx-react-lite";
import { TUser } from "@/server/types";
import { CrownIcon, UserXIcon, WifiOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { store } from "@/stores/store";
import { cn } from "@/lib/utils";

export type RoomUserCardProps = {
  user: TUser;
};

export const RoomUserCard = observer<RoomUserCardProps>(function RoomUserCard({
  user,
}) {
  const canKick =
    store.isAdmin &&
    store.sessionId !== undefined &&
    user.sessionId !== store.sessionId;

  const isSelf =
    store.sessionId !== undefined && user.sessionId === store.sessionId;

  return (
    <div className="flex flex-row items-center gap-2 min-w-0 rounded-lg border bg-card px-3 py-2">
      {user.isAdmin ? (
        <CrownIcon
          className="size-4 shrink-0 text-amber-500"
          aria-label="Администратор"
        />
      ) : null}
      <span
        className={cn(
          "font-medium truncate flex-1 min-w-0",
          user.disconnected && "text-muted-foreground opacity-70",
        )}
      >
        {user.name}
        {isSelf ? (
          <span className="ml-1.5 text-xs font-semibold text-amber-400">
            (Вы)
          </span>
        ) : null}
      </span>
      {user.disconnected ? (
        <WifiOffIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-label="Не в сети"
        />
      ) : null}
      {canKick ? (
        <Button
          size="icon-sm"
          variant="destructive"
          aria-label="Исключить из комнаты"
          onClick={() => store.kickUser(user.sessionId)}
        >
          <UserXIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  );
});
