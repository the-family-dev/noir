"use client";

import { BoardCharacter, BoardShift } from "@/server/types";
import {
  BOARD_GAP,
  BOARD_SHIFT_ANIMATION_MS,
  BOARD_SHIFT_EASE,
  buildCarouselStrip,
  stepOffset,
} from "@/utils/board-shift";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type BoardLineCarouselProps = {
  orientation: "horizontal" | "vertical";
  line: BoardCharacter[];
  direction: BoardShift["direction"];
  /** Число видимых клеток в линии (столбцов для строки / строк для столбца) */
  lineLength: number;
  style: CSSProperties;
  renderCard: (character: BoardCharacter, key: string) => ReactNode;
  onComplete: () => void;
};

/** Карусель одной строки/столбца при сдвиге */
export function BoardLineCarousel({
  orientation,
  line,
  direction,
  lineLength,
  style,
  renderCard,
  onComplete,
}: BoardLineCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [stepPx, setStepPx] = useState(0);

  const strip = buildCarouselStrip(line, direction);
  const isHorizontal = orientation === "horizontal";
  const cellPx = stepPx > 0 ? stepPx - BOARD_GAP : 0;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const track = isHorizontal ? width : height;
      if (track <= 0) return;
      const cell = (track - BOARD_GAP * (lineLength - 1)) / lineLength;
      setStepPx(cell + BOARD_GAP);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isHorizontal, lineLength]);

  const startPx = stepOffset(direction, "start") * stepPx;
  const endPx = stepOffset(direction, "end") * stepPx;

  return (
    <div
      ref={containerRef}
      className="relative z-10 min-h-0 min-w-0 overflow-hidden"
      style={style}
    >
      {stepPx > 0 ? (
        <motion.div
          className={cn(
            "absolute flex will-change-transform",
            isHorizontal
              ? "inset-y-0 left-0 h-full"
              : "inset-x-0 top-0 w-full flex-col",
          )}
          style={{
            gap: BOARD_GAP,
            ...(isHorizontal
              ? {
                  width: stepPx * (lineLength + 1) - BOARD_GAP,
                  height: "100%",
                }
              : {
                  height: stepPx * (lineLength + 1) - BOARD_GAP,
                  width: "100%",
                }),
          }}
          initial={isHorizontal ? { x: startPx } : { y: startPx }}
          animate={isHorizontal ? { x: endPx } : { y: endPx }}
          transition={{
            duration: BOARD_SHIFT_ANIMATION_MS / 1000,
            ease: BOARD_SHIFT_EASE,
          }}
          onAnimationComplete={() => {
            if (completedRef.current) return;
            completedRef.current = true;
            onComplete();
          }}
        >
          {strip.map((character, i) => (
            <div
              key={`${character.id}-${i}`}
              className="min-h-0 min-w-0 shrink-0"
              style={
                isHorizontal
                  ? { width: cellPx, height: "100%" }
                  : { height: cellPx, width: "100%" }
              }
            >
              {renderCard(character, `${character.id}-${i}`)}
            </div>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}
