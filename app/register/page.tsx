"use client";
import { store } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { observer } from "mobx-react-lite";

export default observer(function Register() {
  const { userName } = store;

  const trimmedName = userName?.trim() ?? "";
  const isInvalid = trimmedName === "";

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    store.register();
  };

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4 w-75 h-fit">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 w-full">
          <Input
            value={userName ?? ""}
            onChange={(e) => store.setName(e.target.value)}
            aria-label="name"
            aria-invalid={isInvalid}
            className="w-full"
            placeholder="Введите имя"
            maxLength={20}
          />
          {isInvalid ? (
            <p className="text-destructive text-sm">Введите имя</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={isInvalid}>
          Сохранить
        </Button>
      </form>
    </div>
  );
});
