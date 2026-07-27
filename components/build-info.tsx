import { readFile } from "fs/promises";
import path from "path";

function formatBuildTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function getBuildTime(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), "public", "build-info.json");
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content) as { buildTime?: string };
    if (data.buildTime !== undefined) {
      return data.buildTime;
    }
  } catch {
    // файла нет или невалидный JSON — используем текущее время
  }
  return new Date().toISOString();
}

export async function BuildInfo() {
  const buildTime = await getBuildTime();

  return (
    <span
      className="text-xs text-neutral-500"
    >
      Обновлено: {formatBuildTime(buildTime)}
    </span>
  );
}
