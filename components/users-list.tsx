import { observer } from "mobx-react-lite";
import { TUser } from "../server/types";
import { CrownIcon } from "lucide-react";
import { Avatar, Description, Label, ListBox } from "@heroui/react";

export const UsersList = observer<{ users: TUser[] }>((props) => {
  const { users } = props;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <User key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
});

const User = observer<{ user: TUser }>((props) => {
  const { user } = props;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="select-none" size="sm">
        <Avatar.Fallback>😎</Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col ">
        <div className="flex flex-row gap-2 font-semibold items-center">
          {user.name}
          {user.isAdmin && <CrownIcon className="size-4 text-amber-500" />}
        </div>
        <div className="text-sm text-neutral-500">{user.id}</div>
      </div>
      <div />
    </div>
  );
});
