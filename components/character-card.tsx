import { BoardCharacter } from "@/server/types";
import { cn } from "@/lib/utils";
import { getMonogram } from "@/utils/monogram";

export type CharacterCardProps = {
  character: BoardCharacter;
  /** Карточка принадлежит текущему игроку — видна только ему */
  isSelf?: boolean;
  className?: string;
};

export function CharacterCard({
  character,
  isSelf = false,
  className,
}: CharacterCardProps) {
  const monogram = getMonogram(character.name);

  return (
    <div
      className={cn(
        "relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border/80",
        "bg-linear-to-b from-zinc-800 via-zinc-900 to-black",
        "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        isSelf && "border-amber-400/80 ring-2 ring-amber-400/50",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.55)_100%)]"
        aria-hidden
      />
      {isSelf ? (
        <span className="absolute top-1 right-1 z-10 rounded bg-amber-400 px-1 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-black">
          Вы
        </span>
      ) : null}
      <div className="relative flex flex-1 items-center justify-center px-1">
        <span className="select-none text-[clamp(0.875rem,2.8vw,1.5rem)] font-semibold tracking-wide text-zinc-200/90">
          {monogram}
        </span>
      </div>
      <div className="relative border-t border-white/10 bg-black/40 px-1.5 py-1.5">
        <p className="truncate text-center text-[clamp(0.55rem,1.4vw,0.75rem)] leading-tight text-zinc-300">
          {character.name}
        </p>
      </div>
    </div>
  );
}
