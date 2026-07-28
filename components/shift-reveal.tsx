"use client";

import { BoardShift } from "@/server/types";
import { shiftAxisLabel, shiftDirectionLabel } from "@/utils/board-shift";

export type ShiftRevealProps = {
  actorName: string;
  shift: BoardShift;
};

/** Результат сдвига поля — до конца хода */
export function ShiftReveal({ actorName, shift }: ShiftRevealProps) {
  const axis = shiftAxisLabel(shift.axis);
  const direction = shiftDirectionLabel(shift);
  /** Номер линии с 1 для игроков */
  const lineNumber = shift.index + 1;

  return (
    <div className="w-full max-w-md rounded-xl border border-emerald-400/40 bg-zinc-950/95 px-4 py-3 shadow-[0_8px_32px_rgb(0_0_0/0.45)] backdrop-blur-sm">
      <p className="text-center text-sm text-zinc-300">
        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-semibold text-amber-300">
          {actorName}
        </span>
        {" сдвигает "}
        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-300">
          {axis} {lineNumber}
        </span>
        {" "}
        {direction}
      </p>
    </div>
  );
}
