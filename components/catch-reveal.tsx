"use client";

export type CatchRevealProps = {
  actorName: string;
  targetName: string;
  accusedName: string;
  hit: boolean;
};

/** Результат попытки поймать — до конца хода */
export function CatchReveal({
  actorName,
  targetName,
  accusedName,
  hit,
}: CatchRevealProps) {
  return (
    <div
      className={
        hit
          ? "w-full max-w-md rounded-xl border border-red-500/50 bg-zinc-950/95 px-4 py-3 shadow-[0_8px_32px_rgb(0_0_0/0.45)] backdrop-blur-sm"
          : "w-full max-w-md rounded-xl border border-zinc-500/40 bg-zinc-950/95 px-4 py-3 shadow-[0_8px_32px_rgb(0_0_0/0.45)] backdrop-blur-sm"
      }
    >
      <p className="text-center text-sm text-zinc-300">
        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-semibold text-amber-300">
          {actorName}
        </span>
        {" ловит "}
        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300">
          {targetName}
        </span>
        ,
      </p>
      <p className="mt-2 text-center text-sm text-zinc-300">
        {hit ? "это " : "это не "}
        <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-semibold text-sky-300">
          {accusedName}
        </span>
      </p>
    </div>
  );
}
