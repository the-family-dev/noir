import { observer } from "mobx-react-lite";
import { store } from "../store/store";

export const MyUser = observer(() => {
  const { user } = store;

  if (user == undefined) return null;

  return <div className="absolute top-2 right-2">{user.name}</div>;
});
