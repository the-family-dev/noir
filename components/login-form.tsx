"use client";

import { observer } from "mobx-react-lite";
import {
  Button,
  Form,
  Input,
  InputOTP,
  Label,
  Surface,
  Tabs,
  TextField,
} from "@heroui/react";
import { LoginType, store } from "@/store/store";

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
            <Tabs.Tab id={LoginType.Join}>Присоедениться к игре</Tabs.Tab>
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
            <Label>Код комнаты</Label>
            <InputOTP
              className="self-center"
              maxLength={4}
              value={roomCode}
              onChange={(value) => store.setLoginFormField("roomCode", value)}
            >
              <InputOTP.Group>
                <InputOTP.Slot index={0} />
                <InputOTP.Slot index={1} />
                <InputOTP.Slot index={2} />
                <InputOTP.Slot index={3} />
              </InputOTP.Group>
            </InputOTP>
          </div>
        ) : null}
        <Button className={"w-full"} type="submit">
          {type === LoginType.Join ? "Присоедениться" : "Создать"}
        </Button>
      </Form>
    </Surface>
  );
});
