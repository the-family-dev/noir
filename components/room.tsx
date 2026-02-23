import { store } from "@/store/store";
import { Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { UsersList } from "./users-list";
import { Chat } from "./chat";
import { MyUser } from "./my-user";
import { PersonaCard } from "./persona-card";
import { MyCard } from "./my-card";

const field = Array(36).fill(0);

export const Room = observer(() => {
  const { room } = store;

  if (room === undefined) return null;

  return (
    <div className="flex flex-row gap-8 h-full">
      <MyUser />
      <Surface
        variant="transparent"
        className="rounded border p-4 flex flex-col gap-4 w-75"
      >
        <div>Комната {room.roomCode}</div>
        <UsersList users={room.users} />
      </Surface>

      <div className="grid grid-cols-6 gap-2 h-fit">
        {field.map((_, index) => (
          <MyCard key={index} />
        ))}
      </div>

      <Chat />
    </div>
  );
});
