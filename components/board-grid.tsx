"use client";

import {
  CharacterCard,
  CharacterCardHighlight,
} from "@/components/character-card";
import { BoardShiftArrow } from "@/components/board-shift-arrow";
import { BoardCharacter, BoardShift, TUser } from "@/server/types";
import { BOARD_GAP } from "@/utils/board-shift";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CrosshairIcon,
  SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type BoardGridProps = {
  board: BoardCharacter[];
  boardRows: number;
  boardCols: number;
  selfCharacterId?: string;
  /** sessionId текущего игрока — себя в поимке выбирать нельзя */
  selfSessionId?: string;
  members: TUser[];
  canShift: boolean;
  /** Можно открыть меню действий на карточке */
  canOpenCardMenu: boolean;
  /** id карточек, для которых доступен допрос */
  interrogatableIds: ReadonlySet<string>;
  /** id карточек, для которых доступна поимка */
  catchableIds: ReadonlySet<string>;
  /** Подсветка карточек во время допроса */
  highlightById: ReadonlyMap<string, CharacterCardHighlight>;
  onShift: (shift: BoardShift) => void;
  onInterrogate: (targetCharacterId: string) => void;
  onCatch: (targetCharacterId: string, accusedSessionId: string) => void;
};

function CharacterNameBadge({ name }: { name: string }) {
  return (
    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300 group-focus/dropdown-menu-item:text-rose-300 group-data-highlighted/dropdown-menu-item:text-rose-300 group-data-popup-open/dropdown-menu-item:text-rose-300 group-data-disabled/dropdown-menu-item:text-rose-300/50">
      {name}
    </span>
  );
}

type BoardActionCellProps = {
  character: BoardCharacter;
  selfCharacterId?: string;
  highlight: CharacterCardHighlight;
  canInterrogate: boolean;
  canCatch: boolean;
  catchCandidates: TUser[];
  onInterrogate: (targetCharacterId: string) => void;
  onCatch: (targetCharacterId: string, accusedSessionId: string) => void;
};

/** Карточка с меню действий; эффект наведения держится, пока меню открыто */
function BoardActionCell({
  character,
  selfCharacterId,
  highlight,
  canInterrogate,
  canCatch,
  catchCandidates,
  onInterrogate,
  onCatch,
}: BoardActionCellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isActionable = canInterrogate || canCatch;

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "h-full w-full min-h-0 min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActionable && "cursor-pointer",
            )}
            aria-label={`Действия: ${character.name}`}
          />
        }
      >
        <CharacterCard
          character={character}
          isSelf={character.id === selfCharacterId}
          highlight={highlight}
          isActionable={isActionable}
          isActionActive={isActionable && menuOpen}
          className="h-full w-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        side="bottom"
        className="w-auto min-w-max"
      >
        <DropdownMenuItem
          disabled={!canInterrogate}
          className="whitespace-nowrap"
          onClick={() => {
            if (!canInterrogate) return;
            onInterrogate(character.id);
          }}
        >
          <SearchIcon />
          <span className="whitespace-nowrap">
            Допросить <CharacterNameBadge name={character.name} />
          </span>
        </DropdownMenuItem>

        {canCatch ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="whitespace-nowrap">
              <CrosshairIcon />
              <span className="whitespace-nowrap">
                Поймать <CharacterNameBadge name={character.name} />
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-auto min-w-max">
              {catchCandidates.map((member) => (
                <DropdownMenuItem
                  key={member.sessionId}
                  className="whitespace-nowrap"
                  onClick={() => {
                    onCatch(character.id, member.sessionId);
                  }}
                >
                  <span className="whitespace-nowrap">
                    это{" "}
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-semibold text-sky-300 group-focus/dropdown-menu-item:text-sky-300 group-data-highlighted/dropdown-menu-item:text-sky-300">
                      {member.name}
                    </span>
                    ?
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem disabled className="whitespace-nowrap">
            <CrosshairIcon />
            <span className="whitespace-nowrap">
              Поймать <CharacterNameBadge name={character.name} />
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BoardGrid({
  board,
  boardRows,
  boardCols,
  selfCharacterId,
  selfSessionId,
  members,
  canShift,
  canOpenCardMenu,
  interrogatableIds,
  catchableIds,
  highlightById,
  onShift,
  onInterrogate,
  onCatch,
}: BoardGridProps) {
  const gutter = "2.25rem";
  const catchCandidates = members.filter((m) => m.sessionId !== selfSessionId);

  const renderCard = (character: BoardCharacter, key: string) => {
    const isActionable =
      canOpenCardMenu &&
      (interrogatableIds.has(character.id) || catchableIds.has(character.id));

    return (
      <CharacterCard
        key={key}
        character={character}
        isSelf={character.id === selfCharacterId}
        highlight={highlightById.get(character.id) ?? "none"}
        isActionable={isActionable}
        className="h-full w-full"
      />
    );
  };

  const renderCell = (character: BoardCharacter) => {
    if (!canOpenCardMenu) {
      return renderCard(character, character.id);
    }

    return (
      <BoardActionCell
        character={character}
        selfCharacterId={selfCharacterId}
        highlight={highlightById.get(character.id) ?? "none"}
        canInterrogate={interrogatableIds.has(character.id)}
        canCatch={catchableIds.has(character.id)}
        catchCandidates={catchCandidates}
        onInterrogate={onInterrogate}
        onCatch={onCatch}
      />
    );
  };

  return (
    <div
      className="relative"
      style={{
        width: "min(100cqw, calc(100cqh * var(--board-aspect)))",
        aspectRatio: "var(--board-aspect)",
        // Соотношение сторон с учётом гуттеров стрелок
        ["--board-aspect" as string]: `${boardCols + 0.7} / ${boardRows + 0.7}`,
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gap: BOARD_GAP,
          gridTemplateColumns: `${gutter} repeat(${boardCols}, minmax(0, 1fr)) ${gutter}`,
          gridTemplateRows: `${gutter} repeat(${boardRows}, minmax(0, 1fr)) ${gutter}`,
        }}
      >
        {Array.from({ length: boardCols }, (_, col) => (
          <BoardShiftArrow
            key={`up-${col}`}
            enabled={canShift}
            style={{ gridColumn: col + 2, gridRow: 1 }}
            label="Сдвинуть столбец вверх"
            onClick={() =>
              onShift({
                axis: "column",
                index: col,
                direction: "negative",
              })
            }
          >
            <ArrowUpIcon className="size-4" />
          </BoardShiftArrow>
        ))}

        {Array.from({ length: boardRows }, (_, row) => (
          <div key={`row-wrap-${row}`} className="contents">
            <BoardShiftArrow
              enabled={canShift}
              style={{ gridColumn: 1, gridRow: row + 2 }}
              label="Сдвинуть строку влево"
              onClick={() =>
                onShift({
                  axis: "row",
                  index: row,
                  direction: "negative",
                })
              }
            >
              <ArrowLeftIcon className="size-4" />
            </BoardShiftArrow>

            {Array.from({ length: boardCols }, (_, col) => {
              const character = board[row * boardCols + col]!;
              return (
                <div
                  key={character.id}
                  className="relative min-h-0 min-w-0"
                  style={{
                    gridColumn: col + 2,
                    gridRow: row + 2,
                  }}
                >
                  {renderCell(character)}
                </div>
              );
            })}

            <BoardShiftArrow
              enabled={canShift}
              style={{ gridColumn: boardCols + 2, gridRow: row + 2 }}
              label="Сдвинуть строку вправо"
              onClick={() =>
                onShift({
                  axis: "row",
                  index: row,
                  direction: "positive",
                })
              }
            >
              <ArrowRightIcon className="size-4" />
            </BoardShiftArrow>
          </div>
        ))}

        {Array.from({ length: boardCols }, (_, col) => (
          <BoardShiftArrow
            key={`down-${col}`}
            enabled={canShift}
            style={{ gridColumn: col + 2, gridRow: boardRows + 2 }}
            label="Сдвинуть столбец вниз"
            onClick={() =>
              onShift({
                axis: "column",
                index: col,
                direction: "positive",
              })
            }
          >
            <ArrowDownIcon className="size-4" />
          </BoardShiftArrow>
        ))}
      </div>
    </div>
  );
}
