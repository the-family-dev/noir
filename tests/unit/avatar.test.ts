import { describe, expect, it } from "vitest";
import { getAvatarUri } from "../../utils/avatar";

describe("getAvatarUri", () => {
  it("возвращает data: URI с SVG", () => {
    const uri = getAvatarUri("Аня");

    expect(uri.startsWith("data:image/svg+xml")).toBe(true);
    expect(uri).toContain("%3Csvg");
  });

  it("детерминирован для одного и того же имени", () => {
    expect(getAvatarUri("Аня")).toBe(getAvatarUri("Аня"));
  });

  it("даёт разные аватарки для разных имён", () => {
    expect(getAvatarUri("Аня")).not.toBe(getAvatarUri("Борис"));
  });

  it("игнорирует регистр и пробелы вокруг имени", () => {
    expect(getAvatarUri("  аня ")).toBe(getAvatarUri("Аня"));
  });

  it("подставляет заглушку для пустого имени", () => {
    expect(getAvatarUri("")).toBe(getAvatarUri("   "));
    expect(getAvatarUri("")).toBe(getAvatarUri("Шпион"));
  });
});
