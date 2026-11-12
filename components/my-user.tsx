import { observer } from "mobx-react-lite";
import { store } from "../store/store";
import { UserAvatar } from "./user-avatar";

export const MyUser = observer(() => {
  const { user } = store;

  if (user == undefined) return null;

  return (
    <div className="absolute top-2 right-2 flex flex-row items-center gap-2">
      <span>{user.name}</span>
      <UserAvatar name={user.name} size="sm" />
    </div>
  );
});
