"use client";
import { Chip, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { getSuspect } from "@/server/suspects";
import { TPlayerView } from "@/server/types";
import { getLocationLabel } from "@/utils/board";
import { UserAvatar } from "./user-avatar";

export const InterrogationPanel = observer(function InterrogationPanel() {
  const { game, room, user } = store;

  if (game === undefined || room === undefined || user === undefined) return null;

  const interrogation = game.lastInterrogation;

  if (interrogation === undefined) return null;

  const suspect = getSuspect(interrogation.suspectId);
  const asker = room.users.find((player) => player.id === interrogation.byPlayerId);
  const raisers = interrogation.handRaiserIds
    .map((id) => room.users.find((item) => item.id === id))
    .filter((player): player is TPlayerView => player !== undefined);
  const iRaised = interrogation.handRaiserIds.includes(user.id);

  return (
    <Surface
      variant="transparent"
      className="flex w-full flex-col gap-2 rounded border border-sky-500/40 bg-sky-500/5 p-4"
    >
      <div className="flex flex-row flex-wrap items-center gap-2 font-semibold">
        Допрос: {suspect.name}
        <span className="text-xs font-normal text-neutral-400">
          {getLocationLabel(game.size, interrogation.cellIndex)}
        </span>
        {iRaised && (
          <Chip size="sm" variant="soft" color="accent">
            <Chip.Label>вы подняли руку</Chip.Label>
          </Chip>
        )}
      </div>
      <div className="flex flex-col gap-1 text-sm text-neutral-300">
        <div>
          Спрашивает {asker?.name ?? "неизвестный"}. Руку поднимают:
        </div>
        {raisers.length > 0 ? (
          <div className="flex flex-row flex-wrap items-center gap-3">
            {raisers.map((player) => (
              <span
                key={player.id}
                className="flex flex-row items-center gap-1.5"
              >
                <UserAvatar name={player.name} size="xs" />
                {player.name}
              </span>
            ))}
          </div>
        ) : (
          <div>никто</div>
        )}
      </div>
      <div className="text-xs text-neutral-500">
        Руку поднимают все, кто стоит рядом с подозреваемым, и владелец этой
        тайной личности. Допрос не даёт трофея — он раскрывает круг подозреваемых.
      </div>
    </Surface>
  );
});
