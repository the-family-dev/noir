"use client";

import { observer } from "mobx-react-lite";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { store } from "@/stores/store";
import { LoginType } from "@/stores/login-form-store";

export const LoginForm = observer(() => {
  const { userName, isEnteringRoom } = store;
  const { roomCode, type } = store.loginForm;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEnteringRoom) return;

    if (type === LoginType.Join) {
      store.joinRoom();
      return;
    }

    store.createRoom();
  };

  const loadingLabel =
    type === LoginType.Join ? "Входим в комнату…" : "Создаём комнату…";

  return (
    <div className="relative w-full max-w-md rounded-3xl border p-6 flex flex-col gap-4">
      {isEnteringRoom ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-background/80 backdrop-blur-sm">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{loadingLabel}</p>
        </div>
      ) : null}
      <div className="text-3xl font-bold text-center pb-2">Noir</div>
      <Tabs
        value={type}
        onValueChange={(key) =>
          store.loginForm.setField("type", key as LoginType)
        }
      >
        <TabsList className="w-full">
          <TabsTrigger
            value={LoginType.Join}
            className="flex-1"
            disabled={isEnteringRoom}
          >
            Присоединиться
          </TabsTrigger>
          <TabsTrigger
            value={LoginType.Create}
            className="flex-1"
            disabled={isEnteringRoom}
          >
            Создать комнату
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {userName ? (
          <p className="text-sm text-muted-foreground text-center">
            Вы войдёте как{" "}
            <span className="font-medium text-foreground">{userName}</span>
          </p>
        ) : null}
        {type === LoginType.Join ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="roomCode">Код комнаты</Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) =>
                store.loginForm.setField("roomCode", e.target.value)
              }
              placeholder="Код комнаты"
              disabled={isEnteringRoom}
            />
          </div>
        ) : null}
        <Button
          disabled={userName === undefined || isEnteringRoom}
          className="w-full"
          type="submit"
        >
          {type === LoginType.Join ? "Присоединиться" : "Создать"}
        </Button>
      </form>
    </div>
  );
});
