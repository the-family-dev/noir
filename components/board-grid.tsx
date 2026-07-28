"use client";

import {
  CharacterCard,
  CharacterCardHighlight,
} from "@/components/character-card";
import { BoardLineCarousel } from "@/components/board-line-carousel";
import { BoardShiftArrow } from "@/components/board-shift-arrow";
import { BoardCharacter, BoardShift, TUser } from "@/server/types";
import { BOARD_GAP, getLineCharacters } from "@/utils/board-shift";
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

export type BoardGridProps = {
  board: BoardCharacter[];
  boardSize: number;
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
  /** Активный сдвиг (карусель), иначе обычная сетка */
  animating: (BoardShift & { seq: number }) | null;
  onShift: (shift: BoardShift) => void;
  onInterrogate: (targetCharacterId: string) => void;
  onCatch: (targetCharacterId: string, accusedSessionId: string) => void;
  onAnimComplete: () => void;
};

function CharacterNameBadge({ name }: { name: string }) {
  return (
    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-300 group-focus/dropdown-menu-item:text-rose-300 group-data-highlighted/dropdown-menu-item:text-rose-300 group-data-popup-open/dropdown-menu-item:text-rose-300 group-data-disabled/dropdown-menu-item:text-rose-300/50">
      {name}
    </span>
  );
}

export function BoardGrid({
  board,
  boardSize,
  selfCharacterId,
  selfSessionId,
  members,
  canShift,
  canOpenCardMenu,
  interrogatableIds,
  catchableIds,
  highlightById,
  animating,
  onShift,
  onInterrogate,
  onCatch,
  onAnimComplete,
}: BoardGridProps) {
  const gutter = "2.25rem";
  const animCol = animating?.axis === "column" ? animating.index : null;
  const animRow = animating?.axis === "row" ? animating.index : null;
  const catchCandidates = members.filter((m) => m.sessionId !== selfSessionId);

  const renderCard = (character: BoardCharacter, key: string) => (
    <CharacterCard
      key={key}
      character={character}
      isSelf={character.id === selfCharacterId}
      highlight={highlightById.get(character.id) ?? "none"}
      className="h-full w-full"
    />
  );

  const renderCell = (character: BoardCharacter) => {
    const card = renderCard(character, character.id);

    if (!canOpenCardMenu) {
      return card;
    }

    const canInterrogate = interrogatableIds.has(character.id);
    const canCatch = catchableIds.has(character.id);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="h-full w-full min-h-0 min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Действия: ${character.name}`}
            />
          }
        >
          {card}
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
  };

  return (
    <div
      className="relative"
      style={{
        width: "min(100cqw, calc(100cqh * 3 / 4))",
        aspectRatio: "3 / 4",
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gap: BOARD_GAP,
          gridTemplateColumns: `${gutter} repeat(${boardSize}, minmax(0, 1fr)) ${gutter}`,
          gridTemplateRows: `${gutter} repeat(${boardSize}, minmax(0, 1fr)) ${gutter}`,
        }}
      >
        {Array.from({ length: boardSize }, (_, col) => (
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

        {Array.from({ length: boardSize }, (_, row) => (
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

            {animRow === row && animating ? (
              <BoardLineCarousel
                key={`row-anim-${animating.seq}-${row}`}
                orientation="horizontal"
                line={getLineCharacters(board, boardSize, animating)}
                direction={animating.direction}
                boardSize={boardSize}
                style={{
                  gridColumn: `2 / span ${boardSize}`,
                  gridRow: row + 2,
                }}
                renderCard={renderCard}
                onComplete={onAnimComplete}
              />
            ) : (
              Array.from({ length: boardSize }, (_, col) => {
                if (animCol === col) {
                  return (
                    <div
                      key={`ph-${row}-${col}`}
                      className="min-h-0 min-w-0"
                      style={{
                        gridColumn: col + 2,
                        gridRow: row + 2,
                      }}
                    />
                  );
                }
                const character = board[row * boardSize + col]!;
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
              })
            )}

            <BoardShiftArrow
              enabled={canShift}
              style={{ gridColumn: boardSize + 2, gridRow: row + 2 }}
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

        {animCol !== null && animating ? (
          <BoardLineCarousel
            key={`col-anim-${animating.seq}-${animCol}`}
            orientation="vertical"
            line={getLineCharacters(board, boardSize, animating)}
            direction={animating.direction}
            boardSize={boardSize}
            style={{
              gridColumn: animCol + 2,
              gridRow: `2 / span ${boardSize}`,
            }}
            renderCard={renderCard}
            onComplete={onAnimComplete}
          />
        ) : null}

        {Array.from({ length: boardSize }, (_, col) => (
          <BoardShiftArrow
            key={`down-${col}`}
            enabled={canShift}
            style={{ gridColumn: col + 2, gridRow: boardSize + 2 }}
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
