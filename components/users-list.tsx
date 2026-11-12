import { observer } from "mobx-react-lite";
import { TPlayerView } from "../server/types";
import { CrownIcon, TrophyIcon } from "lucide-react";
import { Chip } from "@heroui/react";
import { store } from "../store/store";
import { getSuspectName } from "../server/suspects";
import { UserAvatar } from "./user-avatar";

export const UsersList = observer<{ users: TPlayerView[] }>((props) => {
  const { users } = props;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <User key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
});

const User = observer<{ user: TPlayerView }>((props) => {
  const { user } = props;
  const { user: me, game } = store;

  const isMe = me?.id === user.id;
  const isTurn = game?.turnPlayerId === user.id;

  return (
    <div
      data-testid="room-user"
      className={
        isTurn
          ? "flex flex-col gap-1 rounded-lg border border-amber-500/60 bg-amber-500/10 p-2"
          : "flex flex-col gap-1 rounded-lg border border-transparent p-2"
      }
    >
      <div className="flex items-center gap-2">
        <UserAvatar name={user.name} size="sm" />
        <div className="flex flex-row items-center gap-2 font-semibold">
          {user.name}
          {user.isAdmin && <CrownIcon className="size-4 text-amber-500" />}
          {isMe && <span className="text-xs text-neutral-400">(вы)</span>}
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm text-neutral-400">
          <TrophyIcon className="size-4" />
          {user.trophies.length}
          {game ? `/${game.targetTrophies}` : null}
        </div>
      </div>
      {user.trophies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.trophies.map((suspectId, index) => (
            <Chip key={`${suspectId}-${index}`} size="sm" variant="soft">
              <Chip.Label>{getSuspectName(suspectId)}</Chip.Label>
            </Chip>
          ))}
        </div>
      )}
      {isTurn && <div className="text-xs text-amber-500">ходит сейчас</div>}
    </div>
  );
});

