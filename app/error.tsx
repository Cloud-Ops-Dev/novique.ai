"use client";

import { useEffect } from "react";
import ThemeShell from "@/components/marketing/ThemeShell";
import PageHero from "@/components/marketing/PageHero";
import DarkButton from "@/components/marketing/DarkButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ThemeShell>
      <PageHero
        eyebrow="Something broke"
        headline={
          <>
            That wasn&apos;t
            <br />
            <span className="text-ink-2">supposed to happen.</span>
          </>
        }
        subhead="An unexpected error interrupted this page. It's been logged on our side — try again, or head back home."
      />
      <div className="mx-auto flex max-w-container flex-wrap justify-center gap-3 px-6 pb-24">
        <DarkButton onClick={reset}>Try again</DarkButton>
        <DarkButton href="/" variant="ghost">
          Back to home
        </DarkButton>
      </div>
    </ThemeShell>
  );
}
