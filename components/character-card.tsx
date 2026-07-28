"use client";

import { BoardCharacter } from "@/server/types";
import { cn } from "@/lib/utils";

export type CharacterCardHighlight = "none" | "zone" | "target";

export type CharacterCardProps = {
  character: BoardCharacter;
  /** Карточка принадлежит текущему игроку — видна только ему */
  isSelf?: boolean;
  highlight?: CharacterCardHighlight;
  /** Можно применить действие (допрос/поимка) — эффект при наведении */
  isActionable?: boolean;
  /** Меню действий открыто — держим эффект наведения */
  isActionActive?: boolean;
  className?: string;
};

export function CharacterCard({
  character,
  isSelf = false,
  highlight = "none",
  isActionable = false,
  isActionActive = false,
  className,
}: CharacterCardProps) {
  const isDead = character.isDead === true;
  const showActionHover = isActionable && !isDead;

  return (
    <div
      className={cn(
        "@container relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border/80",
        "bg-linear-to-b from-zinc-800 via-zinc-900 to-black",
        "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        "transition-[box-shadow,border-color,transform,filter] duration-200",
        isSelf && !isDead && "border-amber-400/80 ring-2 ring-amber-400/50",
        highlight === "zone" && "border-sky-400/70 ring-2 ring-sky-400/40",
        highlight === "target" &&
          "z-10 border-rose-400 ring-2 ring-rose-400/70 shadow-[0_0_24px_rgb(251_113_133/0.35)]",
        isDead && "border-zinc-700",
        showActionHover &&
          "cursor-pointer hover:z-10 hover:scale-[1.05] hover:border-sky-300/70 hover:brightness-110 hover:shadow-[0_0_20px_rgb(56_189_248/0.25)]",
        showActionHover &&
          isActionActive &&
          "z-10 scale-[1.05] border-sky-300/70 brightness-110 shadow-[0_0_20px_rgb(56_189_248/0.25)]",
        className,
      )}
    >
      {/* Контент карточки — при смерти обесцвечен; печать снаружи фильтра */}
      <div
        className={cn(
          "relative flex min-h-0 min-w-0 flex-1 flex-col",
          isDead && "opacity-70 grayscale",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.55)_100%)]"
          aria-hidden
        />
        {isSelf && !isDead ? (
          <span className="absolute top-1 right-1 z-10 rounded bg-amber-400 px-1 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-black">
            Вы
          </span>
        ) : null}
        {/* Место под изображение персонажа */}
        <div className="relative min-h-0 flex-1" />
        <div className="relative shrink-0 border-t border-white/10 bg-black/50 px-1 py-1.5">
          <p
            className={cn(
              "text-center text-[clamp(0.65rem,11cqw,0.95rem)] font-semibold leading-snug text-balance break-words text-zinc-100",
              isDead && "text-zinc-500",
            )}
          >
            {character.name}
          </p>
        </div>
      </div>

      {isDead ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          aria-hidden
        >
          {/* Красная печать-штамп */}
          <span
            className={cn(
              "rotate-[-14deg] select-none rounded-[2px]",
              "border-[2.5px] border-red-500/90 px-[0.5em] py-[0.12em]",
              "text-[clamp(0.7rem,18cqw,1.35rem)] font-black uppercase tracking-[0.2em] text-red-500/90",
              "shadow-[inset_0_0_0_1.5px_rgb(239_68_68/0.55)]",
            )}
          >
            Убит
          </span>
        </div>
      ) : null}
    </div>
  );
}
