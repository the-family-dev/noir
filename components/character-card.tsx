import { TCharacter } from "@/data/characters";
import { cn } from "@/lib/utils";
import { getMonogram } from "@/utils/monogram";

export type CharacterCardProps = {
  character: TCharacter;
  className?: string;
};

export function CharacterCard({ character, className }: CharacterCardProps) {
  const monogram = getMonogram(character.name);

  return (
    <div
      className={cn(
        "relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border/80",
        "bg-linear-to-b from-zinc-800 via-zinc-900 to-black",
        "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.55)_100%)]"
        aria-hidden
      />
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
