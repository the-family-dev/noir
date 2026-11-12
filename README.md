This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Room invite links

- The canonical room address is `/room/<code>` (for example `http://localhost:3000/room/abcdxy`). It is the invite link: the «Скопировать ссылку» button in the room copies it to the clipboard.
- A room code is 6 lowercase latin letters (`ROOM_CODE_LENGTH` in `utils/code-generaator.ts`). It is typed into a plain text field, so case, spaces, dashes and an entire pasted invite URL are reduced to the code on input.
- After creating a room or joining by code the browser moves to that address, so the URL in the bar is always the shareable one.
- A guest opens the link, types a name (it is remembered in `localStorage`) and lands in the room — the code comes from the URL.
- Short links work too: `/<code>` and the older `/game/<code>` redirect to `/room/<code>` (`/game` itself goes home).

## Room layout

- The left column holds the room code, the invite link button and the player list with trophies; the game takes the rest of the width.
- Chat and «Ваша тайная личность» live in a slide-over panel on the right (`components/room-side-panel.tsx`). The toggle buttons float over the playing field in the middle of the right edge; the panel is closed by default, slides in on click, and is closed by the ✕ button or a click on the backdrop.
- While the panel is closed it is `invisible`, so its content is neither clickable nor reachable with the keyboard.
- The board is centred in its column; a card is 100×108 px (`cellWidth` / `cellHeight` in `components/game-board.tsx`), and the row/column shift arrows are centred both horizontally and vertically in their cells.


You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tests

### Unit tests (Vitest)

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Tests live in `tests/unit` and cover the server logic of the «Шпионские игры» scenario: allowed player counts, board size, row/column shifts, refresh, catching a spy, interrogation, secret identities, player removal and game over, plus the shared helpers (avatars, room codes and invite links).

### E2E tests (Playwright)

```bash
npx playwright install chromium  # once, downloads the browser
npm run test:e2e                 # headless run
npm run test:e2e:ui              # interactive UI mode
```

Playwright starts the dev server itself (`npm run dev`) on http://localhost:3000 (set `PORT` to override) and reuses an already running one locally. The specs in `e2e/` walk through: create a room → two players join → room code and player list are synced → the start button is gated by the player count → the chat panel is opened from a floating button and a message reaches the other player (the panel is hidden until the button is pressed) → start the game → the secret identity panel is opened and closed by its button → the turn player shifts a row (others are locked out) → the next player interrogates a suspect → a handover of the creator rights when the admin leaves → a notification is shown for a non-existent room code → the code field accepts any formatting and pasted invite URLs → the invite link `/room/<code>` opens the room, the copied URL matches it, a guest joins with a name only, and the legacy `/game/<code>` address redirects.

## Game rules implemented

- 3–9 players (7 is not a valid scenario), board 5×5 / 6×6 / 7×7, 4 / 3 / 2 trophies to win.
- Every player gets a secret identity — a suspect standing on the board; identities are never sent to other clients.
- A turn is one action: shift a row, shift a column, refresh the field, catch a neighbour or interrogate a neighbour/yourself. Neighbours are all 8 surrounding cells, diagonals included.
- Catch takes the card as a trophy (the victim draws a new identity); cards of caught suspects never return to the deck, and interrogation reveals who raised a hand.
- The game ends on the trophy target, when the evidence deck runs out (leader wins, equal trophies is a draw), or when fewer than two players remain.
- The room creator starts the game and can start a new one after the game over; if the creator leaves, the rights pass to the next player.
- Chat messages carry the sender resolved by the server, so names cannot be spoofed.
- Every player gets a deterministic blobatar avatar built from their nickname (`blobatar`); nicknames are unique inside a room, so the avatars are too.

## Known limitations

- Rooms live in the server memory: a server restart drops all rooms.
- A page reload counts as leaving the room (the seat is freed, the secret identity goes back to the deck); there is no reconnection token yet.
- There is no move timer or bot player: an idle participant blocks the table until they leave.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
