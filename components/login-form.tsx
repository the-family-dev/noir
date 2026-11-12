"use client";

import { observer } from "mobx-react-lite";
import {
  Button,
  Form,
  Input,
  Label,
  Surface,
  Tabs,
  TextField,
} from "@heroui/react";
import { LoginType, store } from "@/store/store";
import {
  isValidRoomCode,
  ROOM_CODE_LENGTH,
  sanitizeRoomCode,
} from "@/utils/code-generaator";

export const LoginForm = observer(() => {
  const { userName, roomCode, type } = store.loginForm;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (type === LoginType.Join) {
      store.joinRoom();

      return;
    }

    store.createRoom();
  };
  return (
    <Surface
      variant="transparent"
      className="w-120 rounded-3xl border p-6 flex flex-col gap-4"
    >
      <div className="text-3xl font-bold text-center pb-4">Нуар</div>
      <Tabs
        onSelectionChange={(key) =>
          store.setLoginFormField("type", key as LoginType)
        }
        variant="primary"
        selectedKey={type}
      >
        <Tabs.ListContainer>
          <Tabs.List>
            <Tabs.Tab id={LoginType.Join}>Присоединиться к игре</Tabs.Tab>
            <Tabs.Tab id={LoginType.Create}>Создать игру</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <TextField variant="secondary" name="name" type="text">
          <Label>Имя</Label>
          <Input
            value={userName}
            onChange={(e) =>
              store.setLoginFormField("userName", e.target.value)
            }
            placeholder="Имя пользователя"
            variant="secondary"
          />
        </TextField>
        {type === LoginType.Join ? (
          <div className="flex flex-col gap-2">
            <TextField variant="secondary" name="roomCode" type="text">
              <Label>Код комнаты</Label>
              <Input
                value={roomCode}
                onChange={(e) =>
                  store.setLoginFormField(
                    "roomCode",
                    sanitizeRoomCode(e.target.value),
                  )
                }
                placeholder="Код комнаты"
                variant="secondary"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </TextField>
            <div className="text-xs text-neutral-500">
              {ROOM_CODE_LENGTH} букв — код есть в ссылке-приглашении
            </div>
          </div>
        ) : null}
        <Button
          className={"w-full"}
          type="submit"
          isDisabled={type === LoginType.Join && !isValidRoomCode(roomCode)}
        >
          {type === LoginType.Join ? "Присоединиться" : "Создать"}
        </Button>
      </Form>
    </Surface>
  );
});
