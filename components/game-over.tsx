"use client";
import { Button, Chip, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { TrophyIcon } from "lucide-react";
import { store } from "@/store/store";
import { getSuspectName } from "@/server/suspects";
import { UserAvatar } from "./user-avatar";

export const GameOver = observer(function GameOver() {
  const { game, room, isAdmin } = store;

  if (game === undefined || room === undefined) return null;

  const winner = room.users.find((player) => player.id === game.winnerId);
  const winLog = [...game.log].reverse().find((entry) => entry.kind === "win");
  const standings = [...room.users].sort(
    (left, right) => right.trophies.length - left.trophies.length,
  );

  return (
    <Surface
      variant="transparent"
      className="flex w-full flex-col gap-4 rounded border border-amber-500/40 bg-amber-500/5 p-6"
    >
      <div className="flex flex-row items-center gap-2 text-2xl font-bold">
        <TrophyIcon className="size-6 text-amber-500" />
        {winner === undefined ? (
          "Игра завершена"
        ) : (
          <>
            <UserAvatar name={winner.name} size="md" />
            {`Победа: ${winner.name}`}
          </>
        )}
      </div>

      <div className="text-sm text-neutral-300">
        {winLog?.text ?? "Партия окончена."}
      </div>

      <div className="flex flex-col gap-2">
        {standings.map((player, index) => (
          <div
            key={player.id}
            className="flex flex-row flex-wrap items-center gap-2 rounded-lg border border-neutral-800 p-2"
          >
            <div className="w-6 text-sm text-neutral-500">{index + 1}.</div>
            <UserAvatar name={player.name} size="xs" />
            <div className="font-semibold">{player.name}</div>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <TrophyIcon className="size-4" />
              {player.trophies.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {player.trophies.map((suspectId, trophyIndex) => (
                <Chip
                  key={`${suspectId}-${trophyIndex}`}
                  size="sm"
                  variant="soft"
                  color="warning"
                >
                  <Chip.Label>{getSuspectName(suspectId)}</Chip.Label>
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isAdmin ? (
        <Button className="w-full" onPress={() => store.playAgain()}>
          Играть снова
        </Button>
      ) : (
        <div className="text-sm text-neutral-400">
          Ждём, когда создатель комнаты начнёт новую партию…
        </div>
      )}
    </Surface>
  );
});
