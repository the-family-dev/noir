"use client";

import { HandIcon } from "lucide-react";
import { TUser } from "@/server/types";

export type InterrogationRevealProps = {
  actorName: string;
  targetName: string;
  revealingPlayers: TUser[];
};

/** Результат допроса: цель и игроки рядом — до конца хода */
export function InterrogationReveal({
  actorName,
  targetName,
  revealingPlayers,
}: InterrogationRevealProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-rose-400/40 bg-zinc-950/95 px-4 py-3 shadow-[0_8px_32px_rgb(0_0_0/0.45)] backdrop-blur-sm">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-rose-300/90">
        Результат допроса
      </p>
      <p className="mt-1 text-center text-sm text-zinc-300">
        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-semibold text-amber-300">
          {actorName}
        </span>
        {" допрашивает "}
        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300">
          {targetName}
        </span>
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {revealingPlayers.length === 0 ? (
          <li className="text-center text-xs text-muted-foreground">
            Никто не поднял руку
          </li>
        ) : (
          revealingPlayers.map((player) => (
            <li
              key={player.sessionId}
              className="flex items-center gap-2 rounded-md bg-sky-500/10 px-2.5 py-1.5 text-sm text-sky-100"
            >
              <HandIcon className="size-4 shrink-0 text-sky-300" aria-hidden />
              <span className="font-medium truncate">{player.name}</span>
              <span className="ml-auto shrink-0 text-[0.65rem] uppercase tracking-wide text-sky-300/80">
                рядом
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
