"use client";

import { store } from "@/store/store";
import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { TMessage } from "@/server/types";
import { cn } from "@/lib/utils";

/** Панель чата поверх игрового поля */
export const Chat = observer(() => {
  const { inputMessage, messages, isOpen } = store.chat;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    store.sendMessage();
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isOpen]);

  // Клик вне панели (кроме кнопки в шапке) сворачивает чат
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (panelRef.current?.contains(target)) return;
      if (target.closest("[data-chat-toggle]")) return;
      store.setChatOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute top-2 right-2 bottom-2 z-30 flex w-75 max-w-[calc(100%-1rem)] flex-col gap-4",
        "rounded-lg border border-border bg-background/95 p-4 shadow-xl backdrop-blur-sm",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">Чат</div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Свернуть чат"
          onClick={() => store.setChatOpen(false)}
        >
          <XIcon />
        </Button>
      </div>
      <ScrollArea className="h-full min-h-0 flex-1">
        <div className="flex flex-1 flex-col justify-end gap-2 pr-2">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <Input
          name="message"
          className="w-full"
          aria-label="Сообщение"
          value={inputMessage}
          onChange={(e) => store.setChatMessage(e.target.value)}
          placeholder="Сообщение"
          maxLength={50}
        />
        <Button
          className="shrink-0"
          type="submit"
          size="icon"
          variant="secondary"
        >
          <SendIcon />
        </Button>
      </form>
    </div>
  );
});

const Message = observer<{ message: TMessage }>((props) => {
  const { userName } = store;
  const { message } = props;

  const isMyMessage = userName === message.sender;

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        isMyMessage ? "self-end" : "self-start",
      )}
    >
      <div
        className={cn(
          "whitespace-normal break-all rounded-lg bg-accent p-2",
          isMyMessage ? "ml-8" : "mr-8",
        )}
      >
        {message.content}
      </div>
      {isMyMessage ? null : (
        <div className="self-start text-xs text-muted-foreground">
          {message.sender}
        </div>
      )}
    </div>
  );
});
