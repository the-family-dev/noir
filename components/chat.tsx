import { store } from "@/store/store";
import { Button, Form, Input, Surface } from "@heroui/react";
import { SendIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FormEvent } from "react";

export const Chat = observer(() => {
  const { inputMessage, messages } = store.chat;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    store.sendMessage();
  };

  return (
    <Surface
      variant="transparent"
      className="rounded border p-4 flex flex-col gap-4 w-75"
    >
      <div>Чат</div>
      <div className="flex flex-col gap-2">
        {messages.map((message, index) => {
          return (
            <div
              className="bg-accent-soft p-2 rounded w-fit break-all"
              key={index}
            >
              {message.content}
            </div>
          );
        })}
      </div>
      <Form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => store.setChatMessage(e.target.value)}
          placeholder="Сообщение"
          variant="secondary"
          maxLength={50}
        />
        <Button type="submit" isIconOnly variant="ghost">
          <SendIcon className="size-6" />
        </Button>
      </Form>
    </Surface>
  );
});
