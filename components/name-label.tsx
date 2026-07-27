"use client";

import { store } from "@/store/store";
import { observer } from "mobx-react-lite";

export const NameLabel = observer(() => {
  const { userName } = store;

  if (userName === undefined) return null;

  return (
    <div className="px-3 py-2 rounded-lg border bg-card flex flex-col gap-1">
      <div className="font-medium text-2xl">{userName}</div>
    </div>
  );
});
