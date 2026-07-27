"use client";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";

export default observer(function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4">
      <LoginForm />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push("/register")}
      >
        Сменить имя
      </Button>
    </div>
  );
});
