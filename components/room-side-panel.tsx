"use client";
import { Button, CloseButton, Surface } from "@heroui/react";
import classNames from "classnames";
import { EyeIcon, MessageCircleIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { store } from "@/store/store";
import { Chat } from "./chat";
import { SecretIdentity } from "./secret-identity";

type TPanel = "chat" | "identity";

const panelTitles: Record<TPanel, string> = {
  chat: "Чат",
  identity: "Ваша тайная личность",
};

/**
 * Чат и карточка тайной личности живут в боковой панели: кнопки висят поверх
 * поля, а содержимое выезжает справа — игровому полю достаётся вся ширина.
 */
export const RoomSidePanel = observer(function RoomSidePanel() {
  const { game } = store;
  const [panel, setPanel] = useState<TPanel | undefined>(undefined);

  const isOpen = panel !== undefined;

  const toggle = (next: TPanel) =>
    setPanel((current) => (current === next ? undefined : next));

  const close = () => setPanel(undefined);

  return (
    <>
      <div className="fixed top-1/2 right-2 z-40 -translate-y-1/2">
        <Surface
          variant="transparent"
          className="flex flex-col gap-1 rounded-full border bg-neutral-950/85 p-1 shadow-lg backdrop-blur"
        >
          <Button
            isIconOnly
            size="sm"
            aria-label={panelTitles.chat}
            aria-expanded={panel === "chat"}
            variant={panel === "chat" ? "primary" : "secondary"}
            onPress={() => toggle("chat")}
          >
            <MessageCircleIcon className="size-4" />
          </Button>
          {game !== undefined ? (
            <Button
              isIconOnly
              size="sm"
              aria-label={panelTitles.identity}
              aria-expanded={panel === "identity"}
              variant={panel === "identity" ? "primary" : "secondary"}
              onPress={() => toggle("identity")}
            >
              <EyeIcon className="size-4" />
            </Button>
          ) : null}
        </Surface>
      </div>

      <div
        aria-hidden
        onClick={close}
        className={classNames(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label={panel === undefined ? panelTitles.chat : panelTitles[panel]}
        className={classNames(
          "fixed top-0 right-0 z-50 flex h-full w-96 max-w-[calc(100%-1rem)] flex-col gap-4 border-l bg-neutral-950 p-4 shadow-2xl",
          "transition-[transform,visibility] duration-200",
          isOpen ? "visible translate-x-0" : "invisible translate-x-full",
        )}
      >
        <CloseButton
          aria-label="Закрыть панель"
          className="absolute top-2 right-2"
          onPress={close}
        />
        {panel === "identity" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <SecretIdentity />
          </div>
        ) : (
          <Chat />
        )}
      </aside>
    </>
  );
});
