"use client";
import { Chip } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { TrophyIcon } from "lucide-react";
import { store } from "@/store/store";
import { getSuspect, getSuspectName } from "@/server/suspects";
import { getLocationLabel } from "@/utils/board";

export const SecretIdentity = observer(function SecretIdentity() {
  const { game, myTrophies } = store;

  if (game === undefined) return null;

  const suspect = getSuspect(game.myIdentityId);
  const hasIdentity = game.myIdentityId !== undefined;
  const progress =
    game.targetTrophies > 0
      ? Math.min(100, Math.round((myTrophies.length / game.targetTrophies) * 100))
      : 0;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-row items-center justify-between gap-2 pr-8">
        <div className="font-semibold">Ваша тайная личность</div>
        <TrophyIcon className="size-4 shrink-0 text-amber-500" />
      </div>

      {hasIdentity ? (
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold">{suspect.name}</div>
          <div className="text-sm text-neutral-400">{suspect.role}</div>
          <div className="text-xs text-neutral-500">
            {getLocationLabel(game.size, game.myIndex)}
          </div>
        </div>
      ) : (
        <div className="text-sm text-amber-500">
          Личность не выдана — дождитесь раздачи тайных личностей.
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between text-xs text-neutral-400">
          <span>Трофеи</span>
          <span>
            {myTrophies.length}/{game.targetTrophies}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {myTrophies.length === 0 ? (
        <div className="text-xs text-neutral-500">
          Пока трофеев нет. Поймайте подозреваемого, чья карта является чьей-то
          тайной личностью.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {myTrophies.map((suspectId, index) => (
            <Chip key={`${suspectId}-${index}`} size="sm" variant="soft" color="warning">
              <Chip.Label>{getSuspectName(suspectId)}</Chip.Label>
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
});
