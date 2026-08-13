"use client";

// Layout-level failure boundary: renders its own <html>/<body> because the root
// layout itself may have crashed, so globals.css and theme tokens can't be
// assumed — styling is inline and self-contained by design.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f0d",
          color: "#e6edea",
          fontFamily:
            "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#4cc9b0",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Something broke
          </p>
          <h1 style={{ fontSize: 32, margin: "12px 0 8px" }}>
            That wasn&apos;t supposed to happen.
          </h1>
          <p style={{ color: "#a7b5b0", margin: "0 0 24px" }}>
            An unexpected error interrupted the site. Try again, or reload the
            page.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#4cc9b0",
              color: "#04110d",
              border: "none",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
