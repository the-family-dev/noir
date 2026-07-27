"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginType, store } from "@/store/store";

export const LoginForm = observer(() => {
  const { userName, loginForm } = store;
  const { roomCode, type } = loginForm;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (type === LoginType.Join) {
      store.joinRoom();
      return;
    }

    store.createRoom();
  };

  return (
    <div className="w-full max-w-md rounded-3xl border p-6 flex flex-col gap-4">
      <div className="text-3xl font-bold text-center pb-2">Noir</div>
      <Tabs
        value={type}
        onValueChange={(key) =>
          store.setLoginFormField("type", key as LoginType)
        }
      >
        <TabsList className="w-full">
          <TabsTrigger value={LoginType.Join} className="flex-1">
            Присоединиться
          </TabsTrigger>
          <TabsTrigger value={LoginType.Create} className="flex-1">
            Создать комнату
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {type === LoginType.Join ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="roomCode">Код комнаты</Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) =>
                store.setLoginFormField("roomCode", e.target.value)
              }
              placeholder="Код комнаты"
            />
          </div>
        ) : null}
        <Button disabled={userName === undefined} className="w-full" type="submit">
          {type === LoginType.Join ? "Присоединиться" : "Создать"}
        </Button>
      </form>
    </div>
  );
});
