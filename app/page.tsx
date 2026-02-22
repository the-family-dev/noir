"use client";
import {
  Button,
  Card,
  Form,
  Input,
  InputOTP,
  Label,
  Surface,
  Tabs,
  TextField,
} from "@heroui/react";
import { LoginType, store } from "@/store/store";
import { observer } from "mobx-react-lite";

export default observer(function Home() {
  const { userName, roomCode, type } = store.loginForm;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    store.joinRoom();
  };

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <Surface
        variant="transparent"
        className="w-120 rounded-3xl border p-6 flex flex-col gap-4"
      >
        <Tabs
          onSelectionChange={(key) =>
            store.setLoginFormField("type", key as LoginType)
          }
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
          <Button type="submit">Join Room</Button>
        </Form>
      </Surface>
    </div>
  );
});
