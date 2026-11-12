"use client";
import { ScrollShadow, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { store } from "@/store/store";
import { TLogEntry, TLogKind } from "@/server/types";

const kindClassNames: Record<TLogKind, string> = {
  info: "text-neutral-300",
  shift: "text-neutral-400",
  refresh: "text-neutral-400",
  catch: "text-amber-400",
  miss: "text-neutral-500",
  interrogate: "text-sky-400",
  win: "text-emerald-400",
  leave: "text-danger",
};

export const GameLog = observer(function GameLog() {
  const { game } = store;

  if (game === undefined) return null;

  const entries = [...game.log].reverse();

  return (
    <Surface
      variant="transparent"
      className="flex w-full flex-col gap-2 rounded border p-4"
    >
      <div className="font-semibold">Хроника партии</div>
      <ScrollShadow className="max-h-40" hideScrollBar>
        <div className="flex flex-col gap-1">
          {entries.length === 0 ? (
            <div className="text-sm text-neutral-500">Пока ничего не произошло.</div>
          ) : (
            entries.map((entry) => <LogRow key={entry.id} entry={entry} />)
          )}
        </div>
      </ScrollShadow>
    </Surface>
  );
});

const LogRow = observer<{ entry: TLogEntry }>((props) => {
  const { entry } = props;

  return (
    <div className={classNames("text-sm leading-snug", kindClassNames[entry.kind])}>
      {entry.text}
    </div>
  );
});
