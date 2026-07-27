import { store } from "@/store/store";
import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { TMessage } from "@/server/types";
import { cn } from "@/lib/utils";

export const Chat = observer(() => {
  const { inputMessage, messages } = store.chat;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    store.sendMessage();
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4 w-75 shrink-0 h-[75vh]">
      <div className="font-medium">Чат</div>
      <ScrollArea className="h-full flex-1">
        <div className="flex flex-col gap-2 flex-1 justify-end pr-2">
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
        <Button className="shrink-0" type="submit" size="icon" variant="secondary">
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
          "p-2 rounded-lg bg-accent whitespace-normal break-all",
          isMyMessage ? "ml-8" : "mr-8",
        )}
      >
        {message.content}
      </div>
      {isMyMessage ? null : (
        <div className="text-xs self-start text-muted-foreground">
          {message.sender}
        </div>
      )}
    </div>
  );
});
