import { store } from "@/store/store";
import { Button, Form, Input, ScrollShadow, Surface } from "@heroui/react";
import { SendIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FormEvent } from "react";
import { TMessage } from "../server/types";
import classNames from "classnames";

export const Chat = observer(() => {
  const { inputMessage, messages } = store.chat;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    store.sendMessage();
  };

  return (
    <Surface
      variant="transparent"
      className="rounded border p-4 flex flex-col gap-4 w-75 h-full"
    >
      <div>Чат</div>
      <ScrollShadow className="h-full" hideScrollBar>
        <div className="flex flex-col gap-2 flex-1 justify-end">
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
    </Surface>
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
        <div className={"text-xs self-start text-neutral-400"}>
          {message.sender.name}
        </div>
      )}
    </div>
  );
});
