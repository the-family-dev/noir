"use client";
import { Button, Form, Input, Label, Surface, TextField } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { FormEvent, useEffect } from "react";
import { store } from "@/store/store";
import { getRoomPath } from "@/utils/room-link";

type TProps = {
  roomCode: string;
};

/**
 * Вход в комнату по ссылке-приглашению: код уже известен из адреса, поэтому
 * остаётся только имя. Введённое имя запоминается для следующих визитов.
 */
export const JoinRoomCard = observer<TProps>(function JoinRoomCard(props) {
  const { roomCode } = props;
  const { loginForm, room } = store;

  useEffect(() => {
    const storedName = store.getStoredName();

    if (store.loginForm.userName === "" && storedName !== "") {
      store.setLoginFormField("userName", storedName);
    }
  }, []);

  const userName = loginForm.userName.trim();
  const currentRoomCode = room?.roomCode;

  if (currentRoomCode !== undefined && currentRoomCode !== roomCode) {
    return (
      <Surface
        variant="transparent"
        className="flex w-120 flex-col gap-4 rounded-3xl border p-6"
      >
        <div className="pb-4 text-center text-3xl font-bold">Нуар</div>
        <div className="text-center text-sm text-neutral-400">
          Вы уже в комнате{" "}
          <span className="font-semibold uppercase">{currentRoomCode}</span>. Чтобы
          зайти в другую, откройте её ссылку в новом окне.
        </div>
        <Link
          className="text-center text-sm text-amber-500 underline"
          href={getRoomPath(currentRoomCode)}
        >
          Вернуться в свою комнату
        </Link>
      </Surface>
    );
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (userName === "") return;

    store.joinRoom(roomCode);
  };

  return (
    <Surface
      variant="transparent"
      className="flex w-120 flex-col gap-4 rounded-3xl border p-6"
    >
      <div className="text-3xl font-bold text-center">Нуар</div>
      <div className="flex flex-col gap-1 text-center">
        <div className="text-sm text-neutral-400">Вас пригласили в комнату</div>
        <div
          data-testid="invite-room-code"
          className="text-2xl font-bold uppercase tracking-[0.4em]"
        >
          {roomCode}
        </div>
      </div>
      <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <TextField variant="secondary" name="name" type="text">
          <Label>Имя</Label>
          <Input
            value={loginForm.userName}
            onChange={(e) =>
              store.setLoginFormField("userName", e.target.value)
            }
            placeholder="Имя пользователя"
            variant="secondary"
          />
        </TextField>
        <Button className="w-full" type="submit" isDisabled={userName === ""}>
          Присоединиться
        </Button>
      </Form>
      <div className="text-xs text-center text-neutral-500">
        Если комнаты уже нет, попросите у друга новую ссылку.{" "}
        <Link className="underline" href="/">
          На главную
        </Link>
      </div>
    </Surface>
  );
});
