import Link from "next/link";
import { BuildInfo } from "@/components/build-info";

const GITHUB_URL = "https://github.com/the-family-dev";

export function AppFooter() {
  return (
    <footer className="flex w-full flex-row items-center justify-end gap-2 text-xs">
      <BuildInfo />
      <span className="text-neutral-600" aria-hidden>
        ·
      </span>
      <Link
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-neutral-600 hover:text-pink-400 hover:decoration-pink-400 underline-offset-2 transition-colors"
      >
        Made with ❤️ by the-family-dev
      </Link>
    </footer>
  );
}
