"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export type BoardShiftArrowProps = {
  enabled: boolean;
  onClick: () => void;
  style: CSSProperties;
  label: string;
  children: ReactNode;
};

export function BoardShiftArrow({
  enabled,
  onClick,
  style,
  label,
  children,
}: BoardShiftArrowProps) {
  return (
    <div
      className="group/arrow relative flex items-center justify-center"
      style={style}
    >
      <motion.div
        className="flex"
        initial={false}
        whileHover={enabled ? { scale: 1.08 } : undefined}
        whileTap={enabled ? { scale: 0.94 } : undefined}
      >
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          disabled={!enabled}
          onClick={onClick}
          aria-label={label}
          className={cn(
            // disabled:opacity-0 перекрывает disabled:opacity-50 у Button —
            // иначе вне хода все стрелки видны полупрозрачными
            "size-7 rounded-full opacity-0 shadow-sm transition-opacity duration-150 disabled:opacity-0",
            enabled
              ? "group-hover/arrow:opacity-100 focus-visible:opacity-100 hover:opacity-100"
              : "pointer-events-none",
          )}
        >
          {children}
        </Button>
      </motion.div>
    </div>
  );
}
