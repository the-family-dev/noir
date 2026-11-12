"use client";
import { Button, Chip, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { GamePhase } from "@/server/types";
import { getSuspect } from "@/server/suspects";
import { getAdjacentIndexes, getLocationLabel } from "@/utils/board";

type TProps = {
  selectedIndex?: number;
  onActionDone: () => void;
};

export const ActionPanel = observer<TProps>(function ActionPanel(props) {
  const { selectedIndex, onActionDone } = props;
  const { game, isMyTurn, turnPlayer } = store;

  if (game === undefined) return null;

  const { size, myIndex } = game;
  const isPlaying = game.phase === GamePhase.Playing;
  const disabled = !isMyTurn || !isPlaying;

  const cell = selectedIndex === undefined ? undefined : game.board[selectedIndex];
  const suspect = cell === undefined ? undefined : getSuspect(cell.suspectId);

  const isSelf = selectedIndex !== undefined && selectedIndex === myIndex;
  const isNeighbor =
    selectedIndex !== undefined &&
    myIndex >= 0 &&
    getAdjacentIndexes(size, myIndex).includes(selectedIndex);

  const canCatch = cell !== undefined && !cell.dead && isNeighbor;
  const canInterrogate = cell !== undefined && !cell.dead && (isNeighbor || isSelf);

  return (
    <Surface
      variant="transparent"
      className="flex w-full flex-col gap-3 rounded border p-4"
    >
      <div className="flex flex-row items-center gap-2">
        <div className="font-semibold">Действие</div>
        {isPlaying ? (
          <Chip size="sm" variant="soft" color={isMyTurn ? "accent" : "default"}>
            <Chip.Label>
              {isMyTurn ? "Ваш ход" : `Ходит ${turnPlayer?.name ?? "…"}`}
            </Chip.Label>
          </Chip>
        ) : (
          <Chip size="sm" variant="soft" color="danger">
            <Chip.Label>Игра завершена</Chip.Label>
          </Chip>
        )}
      </div>

      {cell === undefined ? (
        <div className="text-sm text-neutral-400">
          Выберите подозреваемого на поле: можно выбрать только себя или соседнюю
          клетку — по горизонтали, вертикали или диагонали. Сдвиг ряда или
          столбца, а также обновление поля тоже считаются ходом.
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-sm">
          <div className="font-semibold">
            {suspect?.name}{" "}
            <span className="text-neutral-500">— {suspect?.role}</span>
          </div>
          <div className="text-neutral-400">
            {getLocationLabel(size, selectedIndex ?? -1)}
            {isSelf ? " · ваша тайная личность" : null}
            {cell.dead ? " · уже погиб" : null}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          isDisabled={disabled || !canInterrogate}
          onPress={() => {
            if (selectedIndex === undefined) return;
            store.interrogateSuspect(selectedIndex);
            onActionDone();
          }}
        >
          Допросить
        </Button>
        <Button
          isDisabled={disabled || !canCatch}
          onPress={() => {
            if (selectedIndex === undefined) return;
            store.catchSpy(selectedIndex);
            onActionDone();
          }}
        >
          Поймать шпиона
        </Button>
        <Button
          variant="secondary"
          isDisabled={disabled}
          onPress={() => {
            store.refreshField();
            onActionDone();
          }}
        >
          Обновить поле
        </Button>
      </div>

      <div className="text-xs text-neutral-500">
        Поймать можно только соседнего подозреваемого — рядом по горизонтали,
        вертикали или диагонали. Если у выбранного подозреваемого есть тайная
        личность среди игроков, карта уйдёт в трофеи ловящего.
      </div>
    </Surface>
  );
});
