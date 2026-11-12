import { expect, test } from "@playwright/test";
import type { Browser, BrowserContext, Page } from "@playwright/test";

const roomTitlePattern = /^Комната\s+[a-z]{4}$/;

async function openHome(browser: Browser): Promise<{
  context: BrowserContext;
  page: Page;
}> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByPlaceholder("Имя пользователя")).toBeVisible();

  return { context, page };
}

async function createRoom(page: Page, name: string): Promise<string> {
  await page.getByPlaceholder("Имя пользователя").fill(name);
  await page.getByRole("tab", { name: "Создать игру" }).click();
  await page.getByRole("button", { name: "Создать", exact: true }).click();

  const roomTitle = page.getByText(roomTitlePattern).first();

  await expect(roomTitle).toBeVisible();

  const code = ((await roomTitle.textContent()) ?? "").trim().split(/\s+/)[1];

  expect(code).toMatch(/^[a-z]{4}$/);

  return code;
}

async function joinRoom(page: Page, name: string, code: string) {
  await page.getByPlaceholder("Имя пользователя").fill(name);

  const otpInput = page.locator("input[data-input-otp]");

  await otpInput.click();
  await page.keyboard.type(code, { delay: 40 });
  await expect(otpInput).toHaveValue(code);

  await page.getByRole("button", { name: "Присоединиться", exact: true }).click();
  await expect(page.getByText(roomTitlePattern).first()).toBeVisible();
}

async function findTurnPage(pages: Page[]): Promise<Page> {
  for (const page of pages) {
    if (await page.getByText("Ваш ход", { exact: true }).isVisible()) return page;
  }

  throw new Error("Ни один игрок не получил ход");
}

test.describe("Шпионские игры", () => {
  test("лобби, старт партии и первый ход", async ({ browser }) => {
    const admin = await openHome(browser);
    const code = await createRoom(admin.page, "Админ");

    const second = await openHome(browser);

    await joinRoom(second.page, "Игрок 2", code);
    await expect(admin.page.getByText("Игрок 2", { exact: true })).toBeVisible();
    await expect(admin.page.getByText("Участников: 2")).toBeVisible();
    await expect(
      admin.page.getByRole("button", { name: "Начать игру" }),
    ).toBeDisabled();

    const third = await openHome(browser);

    await joinRoom(third.page, "Игрок 3", code);
    await expect(admin.page.getByText("Участников: 3")).toBeVisible();

    // У каждого игрока своя детерминированная аватарка, построенная из имени
    const userRows = admin.page.getByTestId("room-user");

    await expect(userRows).toHaveCount(3);

    const avatarSources = await userRows
      .locator('img[data-testid="user-avatar"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src") ?? ""));

    expect(avatarSources).toHaveLength(3);
    expect(new Set(avatarSources).size).toBe(3);

    for (const src of avatarSources) {
      expect(src.startsWith("data:image/svg+xml")).toBe(true);
    }

    // data: URI действительно декодируется браузером в картинку
    await expect
      .poll(() =>
        userRows
          .locator('img[data-testid="user-avatar"]')
          .evaluateAll((nodes) =>
            nodes.every((node) => (node as HTMLImageElement).naturalWidth > 0),
          ),
      )
      .toBe(true);

    const startButton = admin.page.getByRole("button", { name: "Начать игру" });

    await expect(startButton).toBeEnabled();

    // Чат работает до старта партии
    await admin.page.getByPlaceholder("Сообщение").fill("Всем привет");
    await admin.page.getByPlaceholder("Сообщение").press("Enter");
    await expect(second.page.getByText("Всем привет")).toBeVisible();

    await startButton.click();

    const pages = [admin.page, second.page, third.page];

    for (const page of pages) {
      await expect(page.getByText("Ваша тайная личность")).toBeVisible();
      await expect(page.getByText("Хроника партии")).toBeVisible();
      await expect(page.getByRole("button", { name: /Поймать шпиона/ })).toBeVisible();
    }

    const turnPage = await findTurnPage(pages);

    for (const page of pages) {
      if (page === turnPage) continue;

      await expect(
        page.getByRole("button", { name: "Сдвинуть ряд 1 вправо" }),
      ).toBeDisabled();
    }

    await turnPage.getByRole("button", { name: "Сдвинуть ряд 1 вправо" }).click();

    for (const page of pages) {
      await expect(page.getByText(/сдвигает ряд 1 вправо/)).toBeVisible();
    }

    await expect(turnPage.getByText("Ваш ход", { exact: true })).toBeHidden();

    const nextTurnPage = await findTurnPage(pages);

    expect(nextTurnPage).not.toBe(turnPage);

    // Допрос своей личности доступен и раскрывает круг подозреваемых
    const myCell = nextTurnPage
      .locator("button")
      .filter({ has: nextTurnPage.getByText("Вы", { exact: true }) });

    await expect(myCell).toHaveCount(1);
    await myCell.click();
    await nextTurnPage.getByRole("button", { name: "Допросить" }).click();

    for (const page of pages) {
      await expect(page.getByText(/^Допрос:/)).toBeVisible();
    }

    await expect(pages[0].getByText(/допрашивает/)).toBeVisible();

    await admin.context.close();
    await second.context.close();
    await third.context.close();
  });

  test("несуществующая комната показывает уведомление", async ({ browser }) => {
    const guest = await openHome(browser);

    await guest.page.getByPlaceholder("Имя пользователя").fill("Гость");

    const otpInput = guest.page.locator("input[data-input-otp]");

    await otpInput.click();
    await guest.page.keyboard.type("0000", { delay: 40 });
    await guest.page
      .getByRole("button", { name: "Присоединиться", exact: true })
      .click();

    await expect(guest.page.getByText("Комната «0000» не найдена")).toBeVisible();
    await expect(guest.page.getByPlaceholder("Имя пользователя")).toBeVisible();

    await guest.context.close();
  });

  test("ссылка-приглашение открывает комнату напрямую", async ({ browser }) => {
    const admin = await openHome(browser);
    const code = await createRoom(admin.page, "Админ");

    // После создания комнаты адрес сам становится ссылкой-приглашением
    await expect(admin.page).toHaveURL(new RegExp(`/room/${code}$`));

    await admin.context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await admin.page.getByRole("button", { name: "Скопировать ссылку" }).click();

    const inviteUrl = await admin.page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    const origin = new URL(admin.page.url()).origin;

    expect(inviteUrl).toBe(`${origin}/room/${code}`);

    // Приглашённому остаётся ввести только имя: код берётся из адреса
    const guestContext = await browser.newContext();
    const guest = await guestContext.newPage();

    await guest.goto(inviteUrl);
    await expect(guest.getByTestId("invite-room-code")).toHaveText(code);

    await guest.getByPlaceholder("Имя пользователя").fill("Гость");
    await guest.getByRole("button", { name: "Присоединиться" }).click();

    await expect(guest.getByText(roomTitlePattern).first()).toBeVisible();
    await expect(admin.page.getByText("Участников: 2")).toBeVisible();
    await expect(admin.page.getByText("Гость", { exact: true })).toBeVisible();

    // Старые ссылки вида /game/<код> ведут на новый адрес
    await guest.goto(`/game/${code}`);
    await expect(guest).toHaveURL(new RegExp(`/room/${code}$`));
    await expect(guest.getByTestId("invite-room-code")).toHaveText(code);

    // Короткая ссылка /<код> тоже открывает комнату
    await guest.goto(`/${code}`);
    await expect(guest).toHaveURL(new RegExp(`/room/${code}$`));
    await expect(guest.getByTestId("invite-room-code")).toHaveText(code);

    // Имя запомнилось: после повторного открытия ссылки хватает одной кнопки
    await guest.goto(`/room/${code}`);
    await expect(guest.getByPlaceholder("Имя пользователя")).toHaveValue("Гость");
    await expect(
      guest.getByRole("button", { name: "Присоединиться" }),
    ).toBeEnabled();

    await admin.context.close();
    await guestContext.close();
  });

  test("права создателя переходят, когда админ покидает комнату", async ({
    browser,
  }) => {
    const admin = await openHome(browser);
    const code = await createRoom(admin.page, "Админ");

    const second = await openHome(browser);
    await joinRoom(second.page, "Игрок 2", code);

    const third = await openHome(browser);
    await joinRoom(third.page, "Игрок 3", code);

    const fourth = await openHome(browser);
    await joinRoom(fourth.page, "Игрок 4", code);

    await expect(admin.page.getByText("Участников: 4")).toBeVisible();

    // Создатель комнаты уходит: право начать партию переходит следующему игроку
    await admin.context.close();

    await expect(second.page.getByText("Участников: 3")).toBeVisible();

    const startButton = second.page.getByRole("button", { name: "Начать игру" });

    await expect(startButton).toBeEnabled();
    await expect(
      third.page.getByRole("button", { name: "Начать игру" }),
    ).toHaveCount(0);

    await startButton.click();

    for (const page of [second.page, third.page, fourth.page]) {
      await expect(page.getByText("Ваша тайная личность")).toBeVisible();
      await expect(page.getByText("Хроника партии")).toBeVisible();
    }

    await second.context.close();
    await third.context.close();
    await fourth.context.close();
  });

  test("диагональные соседи доступны для выбора", async ({ browser }) => {
    const admin = await openHome(browser);
    const code = await createRoom(admin.page, "Админ");

    const second = await openHome(browser);
    await joinRoom(second.page, "Игрок 2", code);

    const third = await openHome(browser);
    await joinRoom(third.page, "Игрок 3", code);

    await admin.page.getByRole("button", { name: "Начать игру" }).click();

    const pages = [admin.page, second.page, third.page];

    for (const page of pages) {
      await expect(page.getByText("Хроника партии")).toBeVisible();
    }

    const turnPage = await findTurnPage(pages);

    const result = await turnPage.evaluate(() => {
      const ownButton = Array.from(document.querySelectorAll("button")).find(
        (button) =>
          !button.hasAttribute("aria-label") &&
          Array.from(button.querySelectorAll("span")).some(
            (span) => span.textContent === "Вы",
          ),
      );

      if (ownButton === undefined) throw new Error("Не найдена своя клетка");

      const grid = ownButton.closest(".grid");

      if (grid === null) throw new Error("Не найдено игровое поле");

      const cells = Array.from(
        grid.querySelectorAll("button:not([aria-label])"),
      ) as HTMLButtonElement[];
      const boxes = cells.map((cell) => cell.getBoundingClientRect());
      const lefts = [...new Set(boxes.map((box) => Math.round(box.left)))].sort(
        (a, b) => a - b,
      );
      const tops = [...new Set(boxes.map((box) => Math.round(box.top)))].sort(
        (a, b) => a - b,
      );
      const ownBox = ownButton.getBoundingClientRect();
      const row = tops.indexOf(Math.round(ownBox.top));
      const column = lefts.indexOf(Math.round(ownBox.left));

      const isEnabled = (targetRow: number, targetColumn: number) => {
        const index = boxes.findIndex(
          (box) =>
            Math.round(box.top) === tops[targetRow] &&
            Math.round(box.left) === lefts[targetColumn],
        );

        return index >= 0 && !cells[index].disabled;
      };

      const diagonals = [
        [row + 1, column + 1],
        [row + 1, column - 1],
        [row - 1, column + 1],
        [row - 1, column - 1],
      ].filter(
        ([targetRow, targetColumn]) =>
          targetRow >= 0 &&
          targetRow < tops.length &&
          targetColumn >= 0 &&
          targetColumn < lefts.length,
      );

      return {
        ownEnabled: !(ownButton as HTMLButtonElement).disabled,
        diagonals: diagonals.length,
        diagonalsEnabled: diagonals.map(([r, c]) => isEnabled(r, c)),
      };
    });

    expect(result.ownEnabled).toBe(true);
    expect(result.diagonals).toBeGreaterThan(0);
    expect(result.diagonalsEnabled.every(Boolean)).toBe(true);

    await admin.context.close();
    await second.context.close();
    await third.context.close();
  });
});
