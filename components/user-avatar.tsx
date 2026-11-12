import classNames from "classnames";
import { getAvatarUri } from "@/utils/avatar";

type TUserAvatarSize = "xs" | "sm" | "md" | "lg";

const sizeClass: Record<TUserAvatarSize, string> = {
  xs: "size-5",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

type TProps = {
  name: string;
  size?: TUserAvatarSize;
  className?: string;
};

/**
 * Аватарка игрока: детерминированный блобатар, построенный из имени.
 * Имена внутри комнаты уникальны, поэтому и аватарки не повторяются.
 */
export function UserAvatar({ name, size = "sm", className }: TProps) {
  return (
    <img
      src={getAvatarUri(name)}
      alt=""
      aria-hidden="true"
      draggable={false}
      data-testid="user-avatar"
      className={classNames(
        "shrink-0 select-none rounded-full bg-neutral-800 object-cover ring-1 ring-white/10",
        sizeClass[size],
        className,
      )}
    />
  );
}
