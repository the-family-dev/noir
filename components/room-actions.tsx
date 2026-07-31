import { store } from "@/stores/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { observer } from "mobx-react-lite";
import {
  MoreVerticalIcon,
  LogOutIcon,
  CopyIcon,
  LinkIcon,
  MessageCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { RoomParticipantsList } from "@/components/room-participants-list";

export const RoomActions = observer(function RoomActions() {
  const { room, chat } = store;

  if (room === undefined) return null;

  const handleCopyRoomLink = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/game/${room.roomCode}`
          : "";
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка на комнату скопирована");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      toast.success("Код комнаты скопирован");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        data-chat-toggle
        aria-label={chat.isOpen ? "Свернуть чат" : "Открыть чат"}
        aria-pressed={chat.isOpen}
        onClick={() => store.chat.toggle()}
      >
        <MessageCircleIcon className="size-5" />
      </Button>
      <RoomParticipantsList />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="secondary" size="icon" aria-label="Меню" />}
        >
          <MoreVerticalIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Комната</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleCopyCode}>
              <CopyIcon />
              Копировать код
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyRoomLink}>
              <LinkIcon />
              Копировать ссылку
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => store.leaveRoom()}
          >
            <LogOutIcon />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
