"use client";

import { Button } from "@/components/ui/button";
import { observer } from "mobx-react-lite";
import { store } from "@/stores/store";
import { END_TURN_REVEAL_MS } from "@/utils/constants";
import { isTurnActionUsed } from "@/utils/turn-action";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export const EndTurnButton = observer(function EndTurnButton() {
  const { isMyTurn, room } = store;
  const actionDone =
    isMyTurn && room !== undefined && isTurnActionUsed(room.game);

  // Пока действие не сделано — кнопки нет; при появлении монтируется таймер
  if (!actionDone) return null;

  return <EndTurnButtonReady />;
});

/** Монтируется только после действия — сразу запускает паузу на 3 сек */
function EndTurnButtonReady() {
  const [remainingMs, setRemainingMs] = useState(END_TURN_REVEAL_MS);

  useEffect(() => {
    const until = Date.now() + END_TURN_REVEAL_MS;
    const id = window.setInterval(() => {
      const left = Math.max(0, until - Date.now());
      setRemainingMs(left);
      if (left === 0) window.clearInterval(id);
    }, 200);

    return () => window.clearInterval(id);
  }, []);

  const onCooldown = remainingMs > 0;
  const remainingSec = Math.ceil(remainingMs / 1000);

  return (
    <Button
      size="lg"
      className="min-w-48"
      disabled={onCooldown}
      onClick={() => store.endTurn()}
    >
      {onCooldown ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          <span className="tabular-nums">{remainingSec}</span>
        </>
      ) : (
        "Завершить ход"
      )}
    </Button>
  );
}
