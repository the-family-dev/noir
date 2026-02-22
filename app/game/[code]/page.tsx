"use client";
import { Chat } from "@/components/chat";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";

export default observer(function Game() {
  const { code } = useParams<{
    code?: string;
  }>();

  return (
    <div>
      room page {code}
      <Chat />
    </div>
  );
});
