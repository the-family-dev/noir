"use client";
import { Chat } from "@/components/chat";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { useLayoutEffect } from "react";
import { store } from "../../../store/store";

export default observer(function Game() {
  const { user } = store;

  const { code } = useParams<{
    code?: string;
  }>();

  useLayoutEffect(() => {}, []);

  if (user === undefined) {
    return (
      <div>
        <p>Unauthorised</p>
      </div>
    );
  }

  return (
    <div>
      room page {code}
      <Chat />
    </div>
  );
});
