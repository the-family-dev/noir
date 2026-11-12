"use client";
import { store } from "@/store/store";
import { Button, Form, Input, ScrollShadow } from "@heroui/react";
import { SendIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FormEvent } from "react";
import { TMessage } from "../server/types";
import classNames from "classnames";
import { UserAvatar } from "./user-avatar";

export const Chat = observer(() => {
  const { inputMessage, messages } = store.chat;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    store.sendMessage();
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="pr-10 font-semibold">Чат</div>
      <ScrollShadow className="min-h-0 flex-1" hideScrollBar>
        <div className="flex min-h-full flex-col justify-end gap-2">
          {messages.map((message, index) => {
            return <Message key={index} message={message} />;
          })}
        </div>
      </ScrollShadow>

      <Form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <Input
          name="message"
          className={"w-full"}
          aria-label="Сообщение"
          value={inputMessage}
          onChange={(e) => store.setChatMessage(e.target.value)}
          placeholder="Сообщение"
          variant="secondary"
          maxLength={50}
        />
        <Button type="submit" isIconOnly variant="secondary">
          <SendIcon />
        </Button>
      </Form>
    </div>
  );
});

const Message = observer<{ message: TMessage }>((props) => {
  const { user } = store;
  const { message } = props;

  const isMyMessage = user?.id === message.sender.id;

  return (
    <div
      className={classNames(
        "flex flex-col gap-0.5",
        isMyMessage ? "self-end" : "self-start",
      )}
    >
      <div
        className={classNames(
          "p-2 rounded-lg bg-accent whitespace-normal break-all",
          isMyMessage ? "ml-8" : "mr-8",
        )}
      >
        {message.content}
      </div>
      {isMyMessage ? null : (
        <div
          className={
            "flex flex-row items-center gap-1.5 self-start text-xs text-neutral-400"
          }
        >
          <UserAvatar name={message.sender.name} size="xs" />
          {message.sender.name}
        </div>
      )}
    </div>
  );
});
