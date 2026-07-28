"use client";

import { TUser } from "@/server/types";

export type InterrogationRevealProps = {
  actorName: string;
  targetName: string;
  revealingPlayers: TUser[];
};

/** Результат допроса — до конца хода */
export function InterrogationReveal({
  actorName,
  targetName,
  revealingPlayers,
}: InterrogationRevealProps) {
  const nearbyNames = revealingPlayers.map((p) => p.name);

  return (
    <div className="w-full max-w-md rounded-xl border border-rose-400/40 bg-zinc-950/95 px-4 py-3 shadow-[0_8px_32px_rgb(0_0_0/0.45)] backdrop-blur-sm">
      <p className="text-center text-sm text-zinc-300">
        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-semibold text-amber-300">
          {actorName}
        </span>
        {" допрашивает "}
        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300">
          {targetName}
        </span>
        ,
      </p>
      <p className="mt-2 text-center text-sm text-zinc-300">
        {nearbyNames.length === 0 ? (
          "рядом никого нет"
        ) : (
          <>
            {"рядом "}
            {nearbyNames.map((name, index) => (
              <span key={`${name}-${index}`}>
                {index > 0 &&
                  (index === nearbyNames.length - 1 ? " и " : ", ")}
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-semibold text-sky-300">
                  {name}
                </span>
              </span>
            ))}
          </>
        )}
      </p>
    </div>
  );
}
