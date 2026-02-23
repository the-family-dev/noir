"use client";
import { observer } from "mobx-react-lite";
import { LoginForm } from "../components/login-form";
import { store } from "../store/store";
import { Room } from "../components/room";

export default observer(function Home() {
  const { room } = store;

  if (room) {
    return <Room />;
  }

  return <LoginForm />;
});
