import { redirect } from "next/navigation";

/** Отдельной страницы /game больше нет: вход и комнаты живут на / и /room/<код> */
export default function GamePage() {
  redirect("/");
}
