"use client";

import { BoardCharacter } from "@/server/types";
import { cn } from "@/lib/utils";
import { getMonogram } from "@/utils/monogram";

export type CharacterCardHighlight = "none" | "zone" | "target";

export type CharacterCardProps = {
  character: BoardCharacter;
  /** Карточка принадлежит текущему игроку — видна только ему */
  isSelf?: boolean;
  highlight?: CharacterCardHighlight;
  className?: string;
};

export function CharacterCard({
  character,
  isSelf = false,
  highlight = "none",
  className,
}: CharacterCardProps) {
  const monogram = getMonogram(character.name);
  const isDead = character.isDead === true;

  return (
    <div
      className={cn(
        "relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border/80",
        "bg-linear-to-b from-zinc-800 via-zinc-900 to-black",
        "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        "transition-[box-shadow,border-color,transform] duration-300",
        isSelf && !isDead && "border-amber-400/80 ring-2 ring-amber-400/50",
        highlight === "zone" && "border-sky-400/70 ring-2 ring-sky-400/40",
        highlight === "target" &&
          "z-10 border-rose-400 ring-2 ring-rose-400/70 shadow-[0_0_24px_rgb(251_113_133/0.35)]",
        isDead && "border-zinc-700 opacity-70 grayscale",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.55)_100%)]"
        aria-hidden
      />
      {isDead ? (
        <span className="absolute top-1 left-1 z-10 rounded bg-red-600 px-1 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-white">
          Убит
        </span>
      ) : null}
      {isSelf && !isDead ? (
        <span className="absolute top-1 right-1 z-10 rounded bg-amber-400 px-1 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-black">
          Вы
        </span>
      ) : null}
      <div className="relative flex flex-1 items-center justify-center px-1">
        <span
          className={cn(
            "select-none text-[clamp(0.875rem,2.8vw,1.5rem)] font-semibold tracking-wide text-zinc-200/90",
            isDead && "text-zinc-500 line-through",
          )}
        >
          {monogram}
        </span>
        {isDead ? (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(1.5rem,5vw,2.5rem)] font-black text-red-500/50"
            aria-hidden
          >
            ✕
          </span>
        ) : null}
      </div>
      <div className="relative border-t border-white/10 bg-black/40 px-1.5 py-1.5">
        <p
          className={cn(
            "truncate text-center text-[clamp(0.55rem,1.4vw,0.75rem)] leading-tight text-zinc-300",
            isDead && "text-zinc-500",
          )}
        >
          {character.name}
        </p>
      </div>
    </div>
  );
}
